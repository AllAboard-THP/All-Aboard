module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      if (user_id = cookies.encrypted[:remember_user_token])
        User.find_by(id: user_id)
      elsif (user = env["warden"]&.user)
        user
      else
        reject_unauthorized_connection
      end
    end
  end
end
