class AddFlaggedForModerationToPostsAndComments < ActiveRecord::Migration[8.0]
  def change
    add_column :posts,    :flagged_for_moderation, :boolean, default: false, null: false
    add_column :comments, :flagged_for_moderation, :boolean, default: false, null: false
  end
end
