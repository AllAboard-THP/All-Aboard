class CreateResources < ActiveRecord::Migration[8.1]
  def change
    create_table :resources do |t|
      t.string  :title,      null: false
      t.text    :body,       null: false
      t.bigint  :subject_id
      t.bigint  :user_id,    null: false

      t.timestamps
    end

    add_foreign_key :resources, :subjects
    add_foreign_key :resources, :users
  end
end
