class FeedController < ApplicationController
  before_action :authenticate_user!

  def index
    @selected_subject = Subject.find_by(slug: params[:subject])
    @selected_tag = Tag.find_by(slug: params[:tag])

    @search_query = params[:q].to_s.strip

    posts_scope = Post.includes(:user, :subject, :tags, :likes, :bookmarks)
                      .where(flagged_for_moderation: false)
                      .recent_first
    posts_scope = posts_scope.where(subject: @selected_subject) if @selected_subject.present?
    posts_scope = posts_scope.joins(:tags).where(tags: { id: @selected_tag.id }).distinct if @selected_tag.present?

    if @search_query.present?
      q = "%#{ActiveRecord::Base.sanitize_sql_like(@search_query)}%"
      matching_ids = Post.joins(:subject)
                         .left_joins(:tags)
                         .where(
                           "posts.title LIKE :q OR posts.body LIKE :q OR subjects.name LIKE :q OR tags.name LIKE :q",
                           q: q
                         )
                         .distinct
                         .pluck(:id)
      posts_scope = posts_scope.where(id: matching_ids)
    end

    @pagy, @posts = pagy(posts_scope, limit: 15)

    @recent_contributions = current_user.comments.includes(post: :subject).order(created_at: :desc).limit(5)
    @quick_tags = Tag.joins(:posts).distinct.ordered.limit(5)
    @unanswered_posts = Post.includes(:user, :subject)
                           .where(flagged_for_moderation: false, status: "open")
                           .left_joins(:comments)
                           .where(comments: { id: nil })
                           .order(created_at: :desc)
                           .limit(5)

    recently_viewed_ids = (session[:recently_viewed_post_ids] || []).map(&:to_i)
    @recently_viewed = Post.includes(:user, :subject)
                           .where(id: recently_viewed_ids)
                           .index_by(&:id)
                           .values_at(*recently_viewed_ids)
                           .compact
  end
end
