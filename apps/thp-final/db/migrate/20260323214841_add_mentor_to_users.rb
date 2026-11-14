class AddMentorToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :mentor, :boolean, default: false, null: false
  end
end
