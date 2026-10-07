require "test_helper"

class CommentTest < ActiveSupport::TestCase
  test "invalide sans body et sans attachment" do
    comment = Comment.new(user: users(:one), post: posts(:one))
    assert_not comment.valid?
  end

  test "valide avec body" do
    comment = Comment.new(body: "Super commentaire", user: users(:one), post: posts(:one))
    assert comment.valid?
  end

  test "flagged_for_moderation est false par défaut" do
    comment = Comment.new(body: "Contenu normal", user: users(:one), post: posts(:one))
    comment.save!
    assert_not comment.flagged_for_moderation?
  end
end
