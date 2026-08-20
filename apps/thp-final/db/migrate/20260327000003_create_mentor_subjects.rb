class CreateMentorSubjects < ActiveRecord::Migration[8.1]
  def change
    create_table :mentor_subjects do |t|
      t.references :user,    null: false, foreign_key: true
      t.references :subject, null: false, foreign_key: true
      t.timestamps
    end

    add_index :mentor_subjects, [ :user_id, :subject_id ], unique: true
  end
end
