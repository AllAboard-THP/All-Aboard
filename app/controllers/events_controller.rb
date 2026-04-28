class EventsController < ApplicationController
  def index
    @events = Event.includes(:subject)

    if params[:subject_id].present?
      if params[:subject_id] == "general"
        @events = @events.where(subject_id: nil)
      else
        @events = @events.where(subject_id: params[:subject_id])
      end
    end

    @pagy_upcoming, @upcoming = pagy(@events.upcoming, limit: 9)
    @pagy_past,     @past     = pagy(@events.past.order(starts_at: :desc), limit: 6, page_param: :past_page)
  end

  def show
    @event = Event.find(params[:id])
  end
end
