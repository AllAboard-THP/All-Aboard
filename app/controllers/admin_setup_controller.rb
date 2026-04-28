class AdminSetupController < ApplicationController
  before_action :authenticate_admin_setup!

  def new
    @user = User.new
  end

  def create
    @user = User.new(admin_params)
    @user.role = "admin"

    if @user.save
      redirect_to new_user_session_path, notice: "Compte administrateur créé avec succès ! Connectez-vous."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def authenticate_admin_setup!
    admin_key = params[:admin_key] || session[:admin_key_verified]
    env_key = Rails.application.credentials.admin_setup_key || ENV["ADMIN_SETUP_KEY"]

    unless admin_key.present? && admin_key == env_key
      redirect_to root_path, alert: "Clé d'administration invalide ou manquante"
      return
    end

    session[:admin_key_verified] = admin_key
  end

  def admin_params
    params.require(:user).permit(:email, :password, :password_confirmation, :full_name)
  end
end
