class Admin::AdminsController < Admin::BaseController
  def new
    @user = User.new
  end

  def create
    @user = User.new(admin_params)
    @user.role = "admin"

    if @user.save
      redirect_to admin_users_path, notice: "Compte administrateur créé avec succès. Email: #{@user.email}"
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def admin_params
    params.require(:user).permit(:email, :password, :password_confirmation, :full_name)
  end
end
