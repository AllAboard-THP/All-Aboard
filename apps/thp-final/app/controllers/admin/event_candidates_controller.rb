class Admin::EventCandidatesController < Admin::BaseController
  def fetch
    FetchTechEventsJob.perform_later
    redirect_to admin_event_candidates_path, notice: "Recherche IA lancée en arrière-plan. Les candidats apparaîtront dans quelques instants."
  end

  def index
    @pending   = EventCandidate.pending.includes(:subject).order(:starts_at)
    @approved  = EventCandidate.approved.includes(:subject).order(updated_at: :desc).limit(20)
    @rejected  = EventCandidate.rejected.includes(:subject).order(updated_at: :desc).limit(20)
  end

  def approve
    candidate = EventCandidate.find(params[:id])

    Event.create!(
      title:        candidate.title,
      description:  candidate.description,
      event_type:   candidate.event_type,
      starts_at:    candidate.starts_at,
      location:     candidate.location,
      online:       candidate.online,
      external_url: candidate.external_url,
      organizer:    candidate.organizer,
      subject_id:   candidate.subject_id,
      source:       candidate.source,
      external_id:  candidate.external_id
    )

    candidate.update!(status: "approved")
    redirect_to admin_event_candidates_path, notice: "Événement approuvé et publié."
  end

  def reject
    candidate = EventCandidate.find(params[:id])
    candidate.update!(status: "rejected")
    redirect_to admin_event_candidates_path, notice: "Candidat rejeté."
  end
end
