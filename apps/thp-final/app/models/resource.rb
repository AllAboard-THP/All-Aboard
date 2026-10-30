class Resource < ApplicationRecord
  include Taggable

  belongs_to :user
  belongs_to :subject
  has_many :resource_tags, dependent: :destroy
  has_many :tags, through: :resource_tags

  attr_accessor :tag_list

  enum :status, { pending: 0, published: 1, rejected: 2 }

  validates :title, :body, :subject, presence: true
end
