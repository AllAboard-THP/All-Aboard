class Admin::MessagesController < Admin::BaseController
  def new
    @users = User.where.not(id: current_user.id)
  end

  def create
    recipient = User.find(params[:user_id])
    conversation = Conversation.find_or_create_direct!(sender: current_user, recipient: recipient)
    message = conversation.messages.build(user: current_user, body: params[:message_body])

    if message.save
      redirect_to conversation_path(conversation), notice: "Message envoyé avec succès."
    else
      redirect_to new_admin_message_path, alert: "Erreur lors de l'envoi du message."
    end
  end
end
