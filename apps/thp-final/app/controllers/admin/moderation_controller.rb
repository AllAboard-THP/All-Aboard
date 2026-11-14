class Admin::ModerationController < Admin::BaseController
  def index
    @flagged_posts    = Post.includes(:user, :subject).where(flagged_for_moderation: true).order(created_at: :desc)
    @flagged_comments = Comment.includes(:user, :post).where(flagged_for_moderation: true).order(created_at: :desc)
  end

  def approve_post
    Post.find(params[:id]).update_column(:flagged_for_moderation, false)
    redirect_to admin_moderation_path, notice: "Post approuvé et publié."
  end

  def reject_post
    Post.find(params[:id]).destroy
    redirect_to admin_moderation_path, notice: "Post supprimé."
  end

  def approve_comment
    Comment.find(params[:id]).update_column(:flagged_for_moderation, false)
    redirect_to admin_moderation_path, notice: "Commentaire approuvé et publié."
  end

  def reject_comment
    Comment.find(params[:id]).destroy
    redirect_to admin_moderation_path, notice: "Commentaire supprimé."
  end
end
