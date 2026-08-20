module ProfanityFilter
  extend ActiveSupport::Concern

  included do
    before_save :check_moderation
  end

  private

  def profanity_fields
    []
  end

  def check_moderation
    return if profanity_fields.empty?

    content = profanity_fields.map { |f| send(f).to_s }.reject(&:blank?).join("\n")
    return if content.blank?

    self.flagged_for_moderation = AiModerationService.new.flagged?(content)
  end
end
