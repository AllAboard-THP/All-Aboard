class Subject < ApplicationRecord
  has_many :posts, dependent: :restrict_with_exception

  validates :name, :slug, :icon, :accent_color, presence: true
  validates :slug, uniqueness: true

  scope :ordered, -> { order(:name) }
end
