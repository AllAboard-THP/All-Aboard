class Event < ApplicationRecord
  belongs_to :subject, optional: true

  scope :upcoming, -> { where("starts_at >= ?", Time.current).order(:starts_at) }
  scope :past,     -> { where("starts_at < ?",  Time.current).order(starts_at: :desc) }

  EVENT_TYPES = {
    "hackathon"   => "Hackathon",
    "open_house"  => "Portes ouvertes",
    "conference"  => "Conférence",
    "meetup"      => "Meetup",
    "webinar"     => "Webinaire",
    "other"       => "Autre"
  }.freeze

  def event_type_label
    EVENT_TYPES.fetch(event_type.to_s, "Autre")
  end

  def category_label
    subject&.name || "Général"
  end
end
