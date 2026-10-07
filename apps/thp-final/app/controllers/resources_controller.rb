class ResourcesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_resource, only: [:show, :edit, :update, :destroy]
  before_action :authorize_owner!, only: [:edit, :update, :destroy]

  def index
    @search_query = params[:q].to_s.strip
    resources_scope = Resource.includes(:user, :subject, :tags).published.order(created_at: :desc)

    if @search_query.present?
      q = "%#{ActiveRecord::Base.sanitize_sql_like(@search_query)}%"
      matching_ids = Resource.published
                             .joins("LEFT JOIN subjects ON subjects.id = resources.subject_id")
                             .left_joins(:tags)
                             .where(
                               "resources.title LIKE :q OR resources.body LIKE :q OR subjects.name LIKE :q OR tags.name LIKE :q",
                               q: q
                             )
                             .distinct
                             .pluck(:id)
      resources_scope = resources_scope.where(id: matching_ids)
    end

    @pagy, @resources = pagy(resources_scope, limit: 12)
  end

  def show
  end

  def new
    @resource = Resource.new
    @subjects = Subject.all.order(:name)
  end

  def create
    @resource = current_user.resources.build(resource_params.except(:tag_list))
    @resource.status = (current_user.admin? || current_user.mentor?) ? :published : :pending

    if @resource.save
      @resource.sync_tags!(resource_params[:tag_list])

      if current_user.admin?
        redirect_to admin_dashboard_path, notice: "Ressource publiée."
      elsif current_user.mentor?
        redirect_to mentor_dashboard_path, notice: "Ressource publiée."
      else
        redirect_to resources_path, notice: "Ressource soumise — elle sera visible après validation par un mentor ou un admin."
      end
    else
      @subjects = Subject.all.order(:name)
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @subjects = Subject.all.order(:name)
  end

  def update
    if @resource.update(resource_params.except(:tag_list))
      @resource.sync_tags!(resource_params[:tag_list]) if resource_params[:tag_list]
      redirect_to resource_path(@resource), notice: "Ressource mise à jour."
    else
      @subjects = Subject.all.order(:name)
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @resource.destroy
    redirect_to resources_path, notice: "Ressource supprimée."
  end

  private

  def set_resource
    @resource = Resource.find(params[:id])
  end

  def authorize_owner!
    unless @resource.user == current_user || current_user.admin?
      redirect_to resources_path, alert: "Accès non autorisé."
    end
  end

  def resource_params
    params.require(:resource).permit(:title, :body, :subject_id, :tag_list)
  end
end
