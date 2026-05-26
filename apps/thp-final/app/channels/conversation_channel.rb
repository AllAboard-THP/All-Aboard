class ConversationChannel < ApplicationCable::Channel
  def subscribed
    conversation = Conversation.find_by(id: params[:conversation_id])
    return reject unless conversation&.users&.include?(current_user)

    stream_for conversation
  end

  def typing(data)
    conversation = Conversation.find_by(id: params[:conversation_id])
    return unless conversation&.users&.include?(current_user)

    ConversationChannel.broadcast_to(conversation, {
      type:        "typing",
      user_id:     current_user.id,
      user_name:   current_user.display_name,
      is_typing:   data["is_typing"]
    })
  end
end
