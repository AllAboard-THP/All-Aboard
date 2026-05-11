class GeneratePostSummaryJob < ApplicationJob
  queue_as :default

  def perform(post_id)
    post = Post.find_by(id: post_id)
    return unless post&.resolved?

    comments = post.comments.order(:created_at).map do |c|
      "#{c.user.display_name} : #{c.body}"
    end.join("\n")

    prompt = <<~PROMPT
      Voici un post d'entraide entre développeurs qui a été résolu.

      **Titre :** #{post.title}
      **Description :** #{post.body}
      #{post.code_snippet.present? ? "**Code :** #{post.code_snippet}" : ""}

      **Réponses :**
      #{comments.presence || "Aucune réponse."}

      Génère un résumé concis en français (3-5 phrases max) structuré ainsi :
      - Problème : [description du problème]
      - Solution : [comment il a été résolu]
      Ne mets pas de titre, écris directement le résumé.
    PROMPT

    summary = ClaudeService.new.message(prompt, max_tokens: 300)
    post.update_column(:ai_summary, summary) if summary.present?
  end
end
