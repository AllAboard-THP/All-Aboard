class AiTagSuggestionService
  def suggest(title:, body:)
    prompt = <<~PROMPT
      Tu es un assistant pour une plateforme d'entraide entre développeurs.
      Voici le titre et la description d'un post :

      Titre : #{title.to_s.first(200)}
      Description : #{body.to_s.first(500)}

      Génère entre 2 et 5 sous-tags pertinents (mots-clés techniques courts, en minuscules, séparés par des virgules).
      Exemples de bons tags : "boucle for", "async/await", "css flexbox", "null pointer", "algorithme tri"
      Réponds UNIQUEMENT avec les tags séparés par des virgules, sans explication.
    PROMPT

    response = ClaudeService.new.message(prompt, max_tokens: 60)
    return [] if response.nil?

    response.strip.split(",").map(&:strip).reject(&:blank?).first(5)
  end
end
