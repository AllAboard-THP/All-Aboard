class Admin::DashboardController < Admin::BaseController
  def index
    @total_posts = Post.count
    @total_users = User.count
    @pending_subject_requests = SubjectRequest.where(status: "pending").count
    @pending_event_candidates = EventCandidate.pending.count
    @pending_resources  = Resource.pending.count
    @flagged_count      = Post.where(flagged_for_moderation: true).count +
                          Comment.where(flagged_for_moderation: true).count
    @recent_posts = Post.where(flagged_for_moderation: false).recent_first.limit(10)
  end
end
