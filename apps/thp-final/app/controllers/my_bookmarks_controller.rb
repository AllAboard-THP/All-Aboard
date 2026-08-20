class MyBookmarksController < ApplicationController
  before_action :authenticate_user!

  def index
    @bookmarks = current_user.bookmarks
                             .includes(post: [:user, :subject, :tags, { comments: :user }, { likes: :user }, { bookmarks: :user }])
                             .order(created_at: :desc)
    @posts = @bookmarks.map(&:post)
  end
end
