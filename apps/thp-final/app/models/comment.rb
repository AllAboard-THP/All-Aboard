class Comment < ApplicationRecord
  include ProfanityFilter

  belongs_to :post, counter_cache: true
  belongs_to :user

  validates :body, presence: true

  private

  def profanity_fields = %i[body]
end
