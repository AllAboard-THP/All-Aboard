class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.references :user, null: false, foreign_key: true
      t.references :subject, null: false, foreign_key: true
      t.string :title, null: false
      t.text :body, null: false
      t.text :code_snippet
      t.boolean :urgent, null: false, default: false
      t.integer :status, null: false, default: 0
      t.string :education_level
      t.integer :likes_count, null: false, default: 0
      t.integer :comments_count, null: false, default: 0
      t.integer :bookmarks_count, null: false, default: 0

      t.timestamps
    end
  end
end
