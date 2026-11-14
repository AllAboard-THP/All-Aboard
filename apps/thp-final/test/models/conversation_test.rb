require "test_helper"

class ConversationTest < ActiveSupport::TestCase
  test "find_or_create_direct! crée une conversation entre deux users" do
    conv = Conversation.find_or_create_direct!(sender: users(:one), recipient: users(:two))
    assert conv.persisted?
    assert_includes conv.users, users(:one)
    assert_includes conv.users, users(:two)
  end

  test "find_or_create_direct! retourne la même conversation si elle existe" do
    conv1 = Conversation.find_or_create_direct!(sender: users(:one), recipient: users(:two))
    conv2 = Conversation.find_or_create_direct!(sender: users(:two), recipient: users(:one))
    assert_equal conv1.id, conv2.id
  end

  test "other_participant retourne l'autre utilisateur" do
    conv = Conversation.find_or_create_direct!(sender: users(:one), recipient: users(:two))
    assert_equal users(:two), conv.other_participant(users(:one))
  end

  test "mark_read_for! met à jour last_read_at" do
    conv = Conversation.find_or_create_direct!(sender: users(:one), recipient: users(:two))
    conv.mark_read_for!(users(:one))
    participant = conv.conversation_participants.find_by(user: users(:one))
    assert_not_nil participant.last_read_at
  end
end
