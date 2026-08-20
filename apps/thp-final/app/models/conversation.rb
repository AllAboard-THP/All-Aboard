class Conversation < ApplicationRecord
  has_many :conversation_participants, dependent: :destroy
  has_many :users, through: :conversation_participants
  has_many :messages, -> { order(created_at: :asc) }, dependent: :destroy

  validates :direct_key, presence: true, uniqueness: true

  scope :recent_first, -> { order(updated_at: :desc) }

  def self.direct_key_for(user_a, user_b)
    [ user_a.id, user_b.id ].sort.join(":")
  end

  def self.find_or_create_direct!(sender:, recipient:, topic: nil)
    conversation = find_or_create_by!(direct_key: direct_key_for(sender, recipient)) do |record|
      record.topic = topic
    end

    [ sender, recipient ].each do |user|
      conversation.conversation_participants.find_or_create_by!(user: user)
    end

    conversation
  end

  def other_participant(viewer)
    users.find { |user| user.id != viewer.id } || viewer
  end

  def last_message
    messages.last
  end

  def unread_count_for(user)
    participant = conversation_participants.find { |cp| cp.user_id == user.id }
    threshold = participant&.last_read_at || Time.zone.at(0)
    messages.where("user_id != ? AND created_at > ?", user.id, threshold).count
  end

  def mark_read_for!(user)
    conversation_participants.find_or_create_by!(user: user).update!(last_read_at: Time.current)
  end
end
