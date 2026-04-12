class ClaudeService
  API_URL = "https://api.anthropic.com/v1/messages"
  MODEL   = "claude-haiku-4-5-20251001"

  def initialize
    @api_key = ENV["ANTHROPIC_API_KEY"]
  end

  def message(prompt, system: nil, max_tokens: 512)
    return nil if @api_key.blank?

    conn = Faraday.new do |f|
      f.request  :json
      f.response :json
    end

    body = {
      model:      MODEL,
      max_tokens: max_tokens,
      messages:   [{ role: "user", content: prompt }]
    }
    body[:system] = system if system.present?

    response = conn.post(API_URL) do |req|
      req.headers["x-api-key"]          = @api_key
      req.headers["anthropic-version"]  = "2023-06-01"
      req.headers["content-type"]       = "application/json"
      req.body = body
    end

    response.body.dig("content", 0, "text")
  rescue => e
    Rails.logger.error("[ClaudeService] #{e.message}")
    nil
  end
end
