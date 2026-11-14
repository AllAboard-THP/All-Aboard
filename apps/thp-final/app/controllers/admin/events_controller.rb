class Admin::EventsController < Admin::BaseController
  def new
    @event = Event.new
  end

  def create
    @event = Event.new(event_params)
    if @event.save
      redirect_to admin_event_candidates_path, notice: "Événement créé et publié."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    Event.find(params[:id]).destroy
    redirect_to admin_event_candidates_path, notice: "Événement supprimé."
  end

  private

  def event_params
    params.require(:event).permit(:title, :description, :event_type, :starts_at, :ends_at, :location, :online, :external_url, :organizer, :subject_id)
  end
end
