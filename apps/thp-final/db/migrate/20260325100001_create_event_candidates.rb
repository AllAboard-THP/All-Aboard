class CreateEventCandidates < ActiveRecord::Migration[8.1]
  def change
    create_table :event_candidates do |t|
      t.string  :title,       null: false
      t.text    :description
      t.string  :event_type
      t.datetime :starts_at
      t.string  :location
      t.boolean :online,      default: false, null: false
      t.string  :external_url
      t.string  :organizer
      t.bigint  :subject_id
      t.string  :external_id
      t.string  :source,      default: "eventbrite", null: false
      t.string  :status,      default: "pending",    null: false
      t.text    :raw_data

      t.timestamps
    end

    add_index :event_candidates, [:source, :external_id], unique: true
    add_index :event_candidates, :status
  end
end
