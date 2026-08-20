class ClaudeEventsService
  API_URL = "https://api.anthropic.com/v1/messages"
  MODEL   = "claude-sonnet-4-6"

  PROMPT = <<~PROMPT
    Recherche sur le web les prochains événements tech en France dans les 60 prochains jours.
    Cible : hackathons étudiants, conférences, meetups, webinaires dans ces domaines :
    développement web, Python, JavaScript, Ruby, IA/ML, DevOps, cybersécurité, open source.

    Réponds UNIQUEMENT avec un tableau JSON valide (sans markdown, sans texte avant ou après).
    Maximum 15 événements. Chaque objet doit avoir exactement ces champs :
    - title        : string
    - description  : string (max 300 caractères)
    - event_type   : "hackathon" | "conference" | "meetup" | "webinar" | "other"
    - starts_at    : "YYYY-MM-DD"
    - location     : string ou null (ville/lieu)
    - online       : true | false
    - external_url : string (URL officielle)
    - organizer    : string ou null
    - subject_slug : "ruby" | "javascript" | "python" | "html-css" | "sql" | "devops" | "cybersecurite" | "algorithmie" | null

    Si tu n'as pas assez d'informations fiables, retourne un tableau vide [].
  PROMPT

  def initialize
    @api_key = Rails.application.credentials.anthropic_api_key || ENV["ANTHROPIC_API_KEY"]
  end

  def fetch_events
    return [] if @api_key.blank?

    conn = Faraday.new do |f|
      f.request  :json
      f.response :json
    end

    response = conn.post(API_URL) do |req|
      req.headers["x-api-key"]         = @api_key
      req.headers["anthropic-version"] = "2023-06-01"
      req.headers["anthropic-beta"]    = "web-search-2025-03-05"
      req.headers["content-type"]      = "application/json"
      req.body = {
        model:      MODEL,
        max_tokens: 4096,
        tools:      [{ type: "web_search_20250305", name: "web_search" }],
        messages:   [{ role: "user", content: PROMPT }]
      }
    end

    if response.body["error"]
      Rails.logger.error("[ClaudeEventsService] API error: #{response.body.dig('error', 'message')}")
      return []
    end

    text = response.body.dig("content")
                   &.select { |b| b["type"] == "text" }
                   &.last
                   &.dig("text")
                   .to_s

    parse_json(text)
  rescue => e
    Rails.logger.error("[ClaudeEventsService] #{e.message}")
    []
  end

  private

  def parse_json(text)
    json_str = text.match(/```(?:json)?\s*(\[.*?\])\s*```/m)&.captures&.first ||
               text.match(/\[.*\]/m)&.to_s
    return [] if json_str.blank?

    JSON.parse(json_str)
  rescue JSON::ParserError => e
    Rails.logger.error("[ClaudeEventsService] JSON parse error: #{e.message}")
    []
  end
end
