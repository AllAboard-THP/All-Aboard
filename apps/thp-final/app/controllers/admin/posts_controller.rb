class Admin::PostsController < Admin::BaseController
  def index
    @posts = Post.recent_first
  end

  def destroy
    @post = Post.find(params[:id])
    @post.destroy
    redirect_to admin_posts_path, notice: "Post supprimé avec succès."
  end
end
