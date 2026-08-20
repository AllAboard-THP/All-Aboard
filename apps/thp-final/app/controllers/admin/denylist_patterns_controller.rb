class Admin::DenylistPatternsController < Admin::BaseController
  def index
    @patterns = DenylistPattern.order(created_at: :desc)
    @pattern  = DenylistPattern.new
  end

  def create
    @pattern = DenylistPattern.new(pattern_params)
    if @pattern.save
      redirect_to admin_denylist_patterns_path, notice: "Pattern ajouté."
    else
      @patterns = DenylistPattern.order(created_at: :desc)
      render :index, status: :unprocessable_entity
    end
  end

  def destroy
    DenylistPattern.find(params[:id]).destroy
    redirect_to admin_denylist_patterns_path, notice: "Pattern supprimé."
  end

  def toggle
    pattern = DenylistPattern.find(params[:id])
    pattern.update_column(:active, !pattern.active)
    redirect_to admin_denylist_patterns_path
  end

  private

  def pattern_params
    params.require(:denylist_pattern).permit(:label, :pattern, :active)
  end
end
