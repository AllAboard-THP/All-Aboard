class NotificationMailer < ApplicationMailer
  default from: -> { "StudyLink <noreply@#{Rails.application.credentials.dig(:smtp, :domain) || 'studylink.app'}>" }

  def new_message(recipient, message)
    @recipient    = recipient
    @message      = message
    @sender       = message.user
    @conversation = message.conversation
    mail(to: recipient.email, subject: "💬 Nouveau message de #{@sender.display_name}")
  end

  def new_comment(recipient, comment)
    @recipient = recipient
    @comment   = comment
    @commenter = comment.user
    @post      = comment.post
    mail(to: recipient.email, subject: "💬 #{@commenter.display_name} a répondu à ton post")
  end

  def help_request(mentor, post)
    @mentor = mentor
    @post   = post
    @author = post.user
    mail(to: mentor.email, subject: "🆘 #{@author.display_name} a besoin d'aide — #{@post.subject.name}")
  end
end
