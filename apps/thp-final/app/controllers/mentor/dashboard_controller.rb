class Mentor::DashboardController < Mentor::BaseController
  def index
    @resources = current_user.resources.includes(:subject).order(created_at: :desc)
    subject_ids = current_user.competences.pluck(:id)
    @pending_resources = Resource.includes(:user, :subject, :tags)
                                 .pending
                                 .where(subject_id: subject_ids)
                                 .order(created_at: :asc)
    @help_posts = Post.includes(:user, :subject, :tags)
                      .where(mentor_help_requested: true, subject_id: subject_ids)
                      .order(created_at: :desc)
  end
end
