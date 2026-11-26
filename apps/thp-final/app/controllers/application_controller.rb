class ApplicationController < ActionController::Base
  include Pagy::Backend
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :load_shared_navigation
  before_action :require_cgu_acceptance!, if: :user_signed_in?

  helper_method :active_section

  protected

  def after_sign_in_path_for(resource)
    resource.admin? ? admin_dashboard_path : authenticated_root_path
  end

  def after_sign_out_path_for(_resource_or_scope)
    root_path
  end

  def active_section
    case controller_name
    when "feed", "posts", "comments", "likes", "bookmarks"
      :feed
    when "explore"
      :explore
    when "conversations", "messages"
      :messages
    when "resources"
      :resources
    when "events"
      :events
    end
  end

  def authenticate_admin!
    redirect_to authenticated_root_path, alert: "Accès non autorisé" unless current_user&.admin?
  end

  def authenticate_mentor!
    redirect_to authenticated_root_path, alert: "Accès réservé aux mentors" unless current_user&.mentor?
  end

  private

  def configure_permitted_parameters
    extra_keys = [ :full_name, :headline, :education_level, :bio, :avatar_url, :cgu_accepted_at ]
    devise_parameter_sanitizer.permit(:sign_up, keys: extra_keys)
    devise_parameter_sanitizer.permit(:account_update, keys: extra_keys + [ :notify_on_message, :notify_on_comment, :avatar_image, competence_ids: [] ])
  end

  def load_shared_navigation
    return unless user_signed_in?

    @subjects = Subject.ordered
    @new_post = current_user.posts.build(education_level: current_user.education_level)
    @new_subject_request = current_user.subject_requests.build
    @conversation_count = current_user.unread_messages_count

    if current_user.mentor?
      subject_ids = current_user.competences.pluck(:id)
      @mentor_pending_count = Resource.pending.where(subject_id: subject_ids).count +
                              Post.where(mentor_help_requested: true, subject_id: subject_ids).count
    end
  end

  def record_not_found
    respond_to do |format|
      format.html { redirect_to authenticated_root_path, alert: "Cette ressource n'existe pas ou a été supprimée." }
      format.json { render json: { error: "Not found" }, status: :not_found }
    end
  end

  def require_cgu_acceptance!
    return if current_user.cgu_accepted_at.present?
    return if devise_controller?
    return if controller_name == "legal"

    @requires_cgu_acceptance = true
  end
end
