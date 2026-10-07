class EventCandidate < ApplicationRecord
  belongs_to :subject, optional: true

  enum :status, { pending: "pending", approved: "approved", rejected: "rejected" }

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
end
