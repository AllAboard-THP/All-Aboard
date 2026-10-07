class CreateSubjects < ActiveRecord::Migration[8.1]
  def change
    create_table :subjects do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :icon, null: false
      t.string :accent_color, null: false
      t.integer :posts_count, null: false, default: 0

      t.timestamps
    end

    add_index :subjects, :slug, unique: true
  end
end
