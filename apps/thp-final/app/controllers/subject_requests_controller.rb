class SubjectRequestsController < ApplicationController
  before_action :authenticate_user!, except: :update
  before_action :authenticate_admin!, only: :update
  before_action :set_subject_request, only: [:destroy, :update]

  def create
    @subject_request = current_user.subject_requests.build(subject_request_params)

    if @subject_request.save
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "request-subject-modal",
            partial: "subject_requests/success_modal"
          )
        end
        format.html { redirect_to authenticated_root_path, notice: "Votre demande a été envoyée." }
      end
    else
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "request-subject-modal",
            partial: "subject_requests/modal",
            locals: { subject_request: @subject_request }
          )
        end
        format.html { redirect_to authenticated_root_path, alert: @subject_request.errors.full_messages.to_sentence }
      end
    end
  end

  def destroy
    @subject_request.destroy
    redirect_to authenticated_root_path, notice: "Demande supprimée."
  end

  def update
    new_status = params[:status]
    if %w[approved rejected pending].include?(new_status) && @subject_request.update(status: new_status)
      redirect_to admin_subject_requests_path, notice: "Demande mise à jour."
    else
      redirect_to admin_subject_requests_path, alert: "Erreur lors de la mise à jour."
    end
  end

  private

  def set_subject_request
    @subject_request = SubjectRequest.find(params[:id])
  end

  def authenticate_admin!
    redirect_to authenticated_root_path, alert: "Accès non autorisé" unless current_user&.admin?
  end

  def subject_request_params
    params.require(:subject_request).permit(:name, :description)
  end
end
