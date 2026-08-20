module PostReplaceable
  extend ActiveSupport::Concern

  private

  def replace_post(post)
    @post = Post.includes(:user, :subject, :tags, :likes, :bookmarks).find(post.id)
    render turbo_stream: turbo_stream.replace(
      view_context.dom_id(@post, :card),
      partial: "posts/post",
      locals: { post: @post }
    )
  end
end
