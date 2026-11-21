class DenylistPattern < ApplicationRecord
  validates :label, :pattern, presence: true
  validate :valid_regex

  scope :active, -> { where(active: true) }

  def matches?(text)
    Regexp.new(pattern, Regexp::IGNORECASE).match?(text.to_s)
  rescue RegexpError
    false
  end

  private

  def valid_regex
    Regexp.new(pattern)
  rescue RegexpError => e
    errors.add(:pattern, "n'est pas une expression régulière valide : #{e.message}")
  end
end
