class PostsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_post, only: [:show, :track_view, :destroy, :edit, :update, :help_mentor]
  before_action :authorize_admin!, only: [:destroy]
  before_action :authorize_author!, only: [:edit, :update]

  def show
    record_view(@post.id)
  end

  def track_view
    record_view(@post.id)
    render turbo_stream: turbo_stream.replace(
      "recently_viewed",
      partial: "feed/recently_viewed",
      locals: { recently_viewed: recently_viewed_posts }
    )
  end

  def help_mentor
    unless @post.user == current_user
      redirect_to authenticated_root_path, alert: "Accès non autorisé" and return
    end

    if @post.mentor_help_requested?
      redirect_to post_path(@post), alert: "Tu as déjà demandé l'aide d'un mentor pour ce post."
    else
      @post.update!(mentor_help_requested: true)
      redirect_to post_path(@post), notice: "Ta demande a été transmise aux mentors disponibles en #{@post.subject.name} !"
    end
  end

  def edit
    @subjects = Subject.all.order(:name)
    @post.tag_list = @post.tags.map(&:name).join(", ")
  end

  def update
    if @post.update(post_params.except(:tag_list))
      @post.sync_tags!(post_params[:tag_list])
      redirect_to post_path(@post), notice: "Post mis à jour avec succès."
    else
      @subjects = Subject.all.order(:name)
      @post.tag_list = @post.tags.map(&:name).join(", ")
      render :edit, status: :unprocessable_entity
    end
  end

  def suggest_tags
    title = params[:title].to_s.strip
    body  = params[:body].to_s.strip

    if title.blank? && body.blank?
      return render json: { tags: [] }
    end

    tags = AiTagSuggestionService.new.suggest(title: title, body: body)
    render json: { tags: tags }
  end

  def create
    @post = current_user.posts.build(post_params.except(:tag_list))

    if @post.save
      @post.sync_tags!(post_params[:tag_list])
      redirect_to authenticated_root_path, notice: "Requête publiée avec succès."
    else
      redirect_to authenticated_root_path, alert: @post.errors.full_messages.to_sentence
    end
  end

  def destroy
    @post.destroy
    redirect_to authenticated_root_path, notice: "Post supprimé avec succès."
  end

  private

  def set_post
    @post = Post.includes(:user, :subject, :tags,
                          { comments: :user },
                          { likes: :user },
                          { bookmarks: :user }).find(params[:id])
  end

  def record_view(post_id)
    viewed = (session[:recently_viewed_post_ids] || []).map(&:to_i)
    viewed.prepend(post_id)
    viewed.uniq!
    session[:recently_viewed_post_ids] = viewed.first(4)
  end

  def recently_viewed_posts
    ids = (session[:recently_viewed_post_ids] || []).map(&:to_i)
    Post.includes(:user, :subject).where(id: ids).index_by(&:id).values_at(*ids).compact
  end

  def authorize_admin!
    redirect_to authenticated_root_path, alert: "Accès non autorisé" unless current_user.admin?
  end

  def authorize_author!
    redirect_to authenticated_root_path, alert: "Accès non autorisé" unless @post.user == current_user
  end

  def post_params
    params.require(:post).permit(:title, :body, :code_snippet, :code_language, :subject_id, :urgent, :education_level, :tag_list)
  end
end
