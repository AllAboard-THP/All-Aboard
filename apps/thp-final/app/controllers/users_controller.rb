class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    @user = User.find(params[:id])
    @posts = @user.posts.includes(:subject, :tags, :comments, :likes).recent_first
    @comments = @user.comments.includes(:post).order(created_at: :desc)

    @active_tab = params.fetch(:tab, "posts")
  end
end
