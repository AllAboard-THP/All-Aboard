class ConversationsController < ApplicationController
  before_action :authenticate_user!
  before_action :load_conversations, only: [ :index, :show ]

  def index
    @conversation = @conversations.first
    prepare_current_conversation
  end

  def show
    @conversation = current_user.conversations.includes(:users, messages: :user).find(params[:id])
    prepare_current_conversation
    render :index
  end

  def create
    recipient = User.find(params[:recipient_id])
    source_post = Post.find_by(id: params[:post_id])

    conversation = Conversation.find_or_create_direct!(
      sender: current_user,
      recipient: recipient,
      topic: source_post&.title
    )
    conversation.mark_read_for!(current_user)

    redirect_to conversation_path(conversation)
  end

  private

  def load_conversations
    @conversations = current_user.conversations.includes(:users, messages: :user).recent_first
  end

  def prepare_current_conversation
    return unless @conversation.present?

    @conversation.mark_read_for!(current_user)
    @messages = @conversation.messages.to_a
    @message = @conversation.messages.build
  end
end
