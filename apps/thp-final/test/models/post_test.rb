require "test_helper"

class PostTest < ActiveSupport::TestCase
  test "invalide sans titre" do
    post = Post.new(body: "Un body", user: users(:one), subject: subjects(:one))
    assert_not post.valid?
    assert_includes post.errors[:title], "can't be blank"
  end

  test "invalide sans body" do
    post = Post.new(title: "Un titre", user: users(:one), subject: subjects(:one))
    assert_not post.valid?
    assert_includes post.errors[:body], "can't be blank"
  end

  test "valide avec titre et body" do
    post = Post.new(title: "Titre", body: "Body", user: users(:one), subject: subjects(:one))
    assert post.valid?
  end

  test "liked_by? retourne false si pas de like" do
    assert_not posts(:one).liked_by?(users(:two))
  end

  test "liked_by? retourne true si like présent" do
    post = posts(:one)
    users(:two).likes.create!(post: post)
    assert post.liked_by?(users(:two))
  end

  test "sync_tags! crée les tags" do
    post = posts(:one)
    post.sync_tags!("ruby, rails, test")
    assert_equal 3, post.tags.count
  end

  test "sync_tags! limite à 6 tags" do
    post = posts(:one)
    post.sync_tags!("a, b, c, d, e, f, g, h")
    assert_equal 6, post.tags.count
  end

  test "status open par défaut" do
    post = Post.new
    assert post.open?
  end
end
