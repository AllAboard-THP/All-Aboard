class LegalController < ApplicationController
  skip_before_action :require_cgu_acceptance!

  def cgu; end
  def privacy; end
  def mentions; end

  def accept_cgu
    if params[:cgu_accepted] == "1"
      current_user.update_column(:cgu_accepted_at, Time.current)
      redirect_to authenticated_root_path, notice: "CGU acceptées. Bienvenue sur StudyLink !"
    else
      redirect_back fallback_location: authenticated_root_path, alert: "Veuillez cocher la case pour confirmer la lecture des CGU."
    end
  end
end
