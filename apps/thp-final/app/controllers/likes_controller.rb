class LikesController < ApplicationController
  include PostReplaceable
  before_action :authenticate_user!

  def create
    post = Post.find(params[:post_id])
    current_user.likes.find_or_create_by!(post: post)
    replace_post(post)
  end

  def destroy
    like = current_user.likes.find(params[:id])
    post = like.post
    like.destroy
    replace_post(post)
  end

  alias_method :delete, :destroy
end
