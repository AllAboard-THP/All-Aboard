class AddStatusToResources < ActiveRecord::Migration[8.1]
  def up
    add_column :resources, :status, :integer, default: 0, null: false
    # Existing resources (created by mentors) are already valid → mark as published
    Resource.update_all(status: 1)
  end

  def down
    remove_column :resources, :status
  end
end
