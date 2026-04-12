class Post < ApplicationRecord
  include ProfanityFilter

  attr_accessor :tag_list

  belongs_to :user
  belongs_to :subject, counter_cache: true

  has_many :post_tags, dependent: :destroy
  has_many :tags, through: :post_tags
  has_many :comments, -> { order(created_at: :asc) }, dependent: :destroy
  has_many :likes, dependent: :destroy
  has_many :bookmarks, dependent: :destroy

  enum :status, { open: 0, resolved: 1 }

  validates :title, :body, presence: true

  scope :recent_first, -> { order(created_at: :desc) }

  after_update_commit :schedule_ai_summary, if: -> { saved_change_to_status? && resolved? }

  def liked_by?(user)
    user.present? && likes.any? { |like| like.user_id == user.id }
  end

  def bookmarked_by?(user)
    user.present? && bookmarks.any? { |bookmark| bookmark.user_id == user.id }
  end

  def sync_tags!(raw_tags)
    names = raw_tags.to_s.split(",").map(&:strip).reject(&:blank?).uniq.first(6)
    self.tags = names.map do |name|
      Tag.find_or_create_by!(slug: name.parameterize) do |tag|
        tag.name = name
      end
    end
  end

  private

  def profanity_fields = %i[title body]

  def schedule_ai_summary
    GeneratePostSummaryJob.perform_later(id)
  end
end
