class Mentor::ResourcesController < Mentor::BaseController
  def index
    @pending_resources = Resource.includes(:user, :subject, :tags)
                                 .pending
                                 .where(subject_id: current_user.competences.pluck(:id))
                                 .order(created_at: :asc)
  end

  def approve
    resource = accessible_resource
    resource.update!(status: :published)
    redirect_to mentor_resources_path, notice: "Ressource approuvée et publiée."
  end

  def reject
    resource = accessible_resource
    resource.update!(status: :rejected)
    redirect_to mentor_resources_path, notice: "Ressource refusée."
  end

  private

  def accessible_resource
    Resource.pending
            .where(subject_id: current_user.competences.pluck(:id))
            .find(params[:id])
  end
end
