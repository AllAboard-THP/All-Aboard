class Admin::SubjectRequestsController < Admin::BaseController
  def index
    @pending  = SubjectRequest.where(status: "pending").ordered.includes(:user)
    @approved = SubjectRequest.where(status: "approved").ordered.includes(:user)
    @rejected = SubjectRequest.where(status: "rejected").ordered.includes(:user)
  end

  def update
    @subject_request = SubjectRequest.find(params[:id])
    new_status = params[:status]

    if %w[approved rejected pending].include?(new_status) && @subject_request.update(status: new_status)
      redirect_to admin_subject_requests_path, notice: "Demande mise à jour."
    else
      redirect_to admin_subject_requests_path, alert: "Erreur lors de la mise à jour."
    end
  end
end
