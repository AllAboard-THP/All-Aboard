class Admin::ResourcesController < Admin::BaseController
  def index
    @pending_resources = Resource.includes(:user, :subject, :tags)
                                 .pending
                                 .order(created_at: :asc)
  end

  def approve
    resource = Resource.pending.find(params[:id])
    resource.update!(status: :published)
    redirect_to admin_resources_path, notice: "Ressource approuvée et publiée."
  end

  def reject
    resource = Resource.pending.find(params[:id])
    resource.update!(status: :rejected)
    redirect_to admin_resources_path, notice: "Ressource refusée."
  end
end
