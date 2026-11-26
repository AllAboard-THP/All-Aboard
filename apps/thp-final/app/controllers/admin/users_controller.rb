class Admin::UsersController < Admin::BaseController
  def index
    @users = User.all.order(:created_at)
  end

  def promote_user
    user = User.find(params[:id])
    user.update!(role: params[:admin] == "true" ? "admin" : "user")
    redirect_to admin_users_path, notice: "Rôle administrateur mis à jour."
  end

  def promote_mentor
    user = User.find(params[:id])
    user.update!(mentor: !user.mentor?)
    redirect_to admin_users_path, notice: "Statut mentor mis à jour."
  end
end
