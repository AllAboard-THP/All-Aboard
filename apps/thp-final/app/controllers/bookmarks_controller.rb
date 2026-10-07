class BookmarksController < ApplicationController
  include PostReplaceable
  before_action :authenticate_user!

  def create
    post = Post.find(params[:post_id])
    current_user.bookmarks.find_or_create_by!(post: post)
    replace_post(post)
  end

  def destroy
    bookmark = current_user.bookmarks.find(params[:id])
    post = bookmark.post
    bookmark.destroy
    replace_post(post)
  end

  alias_method :delete, :destroy
end
