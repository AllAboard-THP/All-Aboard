class FetchTechEventsJob < ApplicationJob
  queue_as :default

  def perform
    events = ClaudeEventsService.new.fetch_events
    return if events.empty?

    stored = 0
    events.each do |data|
      store_candidate(data) && (stored += 1)
    end

    Rails.logger.info("[FetchTechEventsJob] #{stored} candidats créés sur #{events.size} événements reçus")
  end

  private

  def store_candidate(data)
    title = data["title"].to_s.truncate(255)
    return false if title.blank?

    external_url = data["external_url"].to_s.presence
    return false if EventCandidate.exists?(external_url: external_url) if external_url.present?

    starts_at = parse_date(data["starts_at"])

    EventCandidate.create!(
      source:       "claude_ai",
      external_id:  generate_external_id(data),
      title:        title,
      description:  data["description"].to_s.truncate(500),
      event_type:   valid_event_type(data["event_type"]),
      starts_at:    starts_at,
      location:     data["location"].to_s.presence,
      online:       data["online"] == true,
      external_url: external_url,
      organizer:    data["organizer"].to_s.presence,
      subject_id:   Subject.find_by(slug: data["subject_slug"])&.id,
      status:       "pending",
      raw_data:     data.to_json
    )
    true
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique
    false
  end

  def parse_date(str)
    Date.parse(str.to_s)
  rescue ArgumentError, TypeError
    nil
  end

  def valid_event_type(type)
    EventCandidate::EVENT_TYPES.key?(type.to_s) ? type.to_s : "other"
  end

  def generate_external_id(data)
    Digest::SHA1.hexdigest("#{data["title"]}#{data["starts_at"]}#{data["external_url"]}")
  end
end
