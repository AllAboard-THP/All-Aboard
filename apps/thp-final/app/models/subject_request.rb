class SubjectRequest < ApplicationRecord
  belongs_to :user

  validates :name, presence: true, length: { minimum: 2, maximum: 60 }
  validates :description, length: { maximum: 500 }

  enum :status, { pending: "pending", approved: "approved", rejected: "rejected" }, default: "pending"

  scope :ordered, -> { order(created_at: :desc) }
end
