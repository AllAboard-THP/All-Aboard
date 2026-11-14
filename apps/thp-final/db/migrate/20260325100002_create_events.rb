class CreateEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :events do |t|
      t.string  :title,       null: false
      t.text    :description
      t.string  :event_type
      t.datetime :starts_at
      t.datetime :ends_at
      t.string  :location
      t.boolean :online,      default: false, null: false
      t.string  :external_url
      t.string  :organizer
      t.bigint  :subject_id
      t.string  :source,      default: "eventbrite", null: false
      t.string  :external_id

      t.timestamps
    end

    add_index :events, :subject_id
    add_index :events, :starts_at
  end
end
