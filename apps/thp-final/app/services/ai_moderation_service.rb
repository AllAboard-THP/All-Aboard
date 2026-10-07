class AiModerationService
  SYSTEM_PROMPT = <<~PROMPT.freeze
    Tu es un modérateur de contenu pour une plateforme d'entraide entre développeurs.
    Réponds uniquement par "OUI" ou "NON".
    "OUI" si le contenu contient : insultes, propos haineux, spam, contenu offensant ou inapproprié.
    "NON" si le contenu est acceptable (même s'il contient du code, des erreurs techniques, ou des frustrations légères).
  PROMPT

  def flagged?(content)
    # Regex d'abord — appel API uniquement si détection
    return false unless fallback_check(content)

    response = ClaudeService.new.message(
      "Ce contenu doit-il être modéré ?\n\n#{content.first(1000)}",
      system: SYSTEM_PROMPT,
      max_tokens: 10
    )

    # Si l'API ne répond pas, on fait confiance au regex
    return true if response.nil?

    response.strip.upcase.start_with?("OUI")
  end

  private

  BANNED_REGEX = /\b(connard|connasse|enculé|putain|salope|pute|fdp|ntm|nique|fuck|shit|bitch|asshole|nigger|cunt)\b/i

  def fallback_check(content)
    return true if content.match?(BANNED_REGEX)

    # Vérifie les patterns configurés par l'admin
    DenylistPattern.where(active: true).any? do |pattern|
      Regexp.new(pattern.pattern, Regexp::IGNORECASE).match?(content)
    rescue RegexpError
      false
    end
  end
end
