require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "display_name retourne full_name si présent" do
    assert_equal "User One", users(:one).display_name
  end

  test "display_name retourne email prefix titleizé si full_name absent" do
    user = User.new(email: "john.doe@example.com", full_name: "")
    assert_equal "John.Doe", user.display_name
  end

  test "profile_avatar retourne avatar_url si défini" do
    assert_equal "https://example.com/one.png", users(:one).profile_avatar
  end

  test "unread_messages_count est >= 0" do
    assert users(:one).unread_messages_count >= 0
  end

  test "contribution_count est >= 0" do
    assert users(:one).contribution_count >= 0
  end
end
