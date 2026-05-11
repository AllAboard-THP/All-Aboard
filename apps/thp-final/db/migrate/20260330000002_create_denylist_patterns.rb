class CreateDenylistPatterns < ActiveRecord::Migration[8.0]
  def change
    create_table :denylist_patterns do |t|
      t.string :label, null: false
      t.string :pattern, null: false
      t.boolean :active, default: true, null: false
      t.timestamps
    end
  end
end
