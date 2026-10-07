class AddMentorHelpRequestedToPosts < ActiveRecord::Migration[8.0]
  def change
    add_column :posts, :mentor_help_requested, :boolean, default: false, null: false
  end
end
