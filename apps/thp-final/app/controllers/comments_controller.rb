class CommentsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_comment, only: [:destroy, :show, :edit, :update]
  before_action :authorize_author!, only: [:edit, :update]

  def show
  end

  def edit
  end

  def update
    if @comment.update(comment_update_params)
      render turbo_stream: turbo_stream.replace(
        dom_id(@comment),
        partial: "comments/comment",
        locals: { comment: @comment }
      )
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def create
    @post = Post.includes(:user, :subject, :tags, comments: :user, likes: :user, bookmarks: :user).find(comment_params[:post_id])
    @comment = @post.comments.build(
      body: comment_params[:body],
      code_snippet: comment_params[:code_snippet].presence,
      code_language: comment_params[:code_language].presence || "plaintext",
      user: current_user
    )

    if @comment.save
      # TODO: activer quand SMTP Brevo configuré
      # if @post.user != current_user && @post.user.notify_on_comment?
      #   NotificationMailer.new_comment(@post.user, @comment).deliver_later
      # end

      render turbo_stream: [
        turbo_stream.replace(
          view_context.dom_id(@post, :card),
          partial: "posts/post",
          locals: { post: @post.reload }
        ),
        turbo_stream.append(
          "post_#{@post.id}_comments",
          partial: "comments/comment",
          locals: { comment: @comment }
        )
      ]
    else
      redirect_to authenticated_root_path, alert: @comment.errors.full_messages.to_sentence
    end
  end

  def destroy
    @post = @comment.post
    comment_id = dom_id(@comment)
    @comment.destroy
    render turbo_stream: [
      turbo_stream.replace(
        view_context.dom_id(@post, :card),
        partial: "posts/post",
        locals: { post: @post.reload }
      ),
      turbo_stream.remove(comment_id)
    ]
  end

  private

  def set_comment
    @comment = Comment.find(params[:id])
  end

  def authorize_author!
    unless @comment.user == current_user
      redirect_to authenticated_root_path, alert: "Accès non autorisé"
    end
  end

  def comment_params
    params.require(:comment).permit(:post_id, :body, :code_snippet, :code_language)
  end

  def comment_update_params
    params.require(:comment).permit(:body, :code_snippet, :code_language)
  end
end

