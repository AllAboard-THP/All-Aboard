require "test_helper"

class LikeTest < ActiveSupport::TestCase
  # fixtures :one = user:one/post:one, :two = user:two/post:two
  test "un user ne peut pas liker deux fois le même post" do
    # like :one (user:one/post:one) déjà créé par fixture
    assert_raises(ActiveRecord::RecordInvalid) do
      Like.create!(user: users(:one), post: posts(:one))
    end
  end

  test "like valide avec user et post sans like existant" do
    # user:one sur post:two n'a pas de fixture
    like = Like.new(user: users(:one), post: posts(:two))
    assert like.valid?
  end
end
