# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_12_164047) do
  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "bookmarks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id", "user_id"], name: "index_bookmarks_on_post_id_and_user_id", unique: true
    t.index ["post_id"], name: "index_bookmarks_on_post_id"
    t.index ["user_id"], name: "index_bookmarks_on_user_id"
  end

  create_table "comments", force: :cascade do |t|
    t.text "body", null: false
    t.string "code_language", default: "plaintext"
    t.text "code_snippet"
    t.datetime "created_at", null: false
    t.boolean "flagged_for_moderation", default: false, null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "conversation_participants", force: :cascade do |t|
    t.integer "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "last_read_at"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["conversation_id", "user_id"], name: "index_conversation_participants_on_conversation_and_user", unique: true
    t.index ["conversation_id"], name: "index_conversation_participants_on_conversation_id"
    t.index ["user_id"], name: "index_conversation_participants_on_user_id"
  end

  create_table "conversations", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "direct_key", null: false
    t.string "topic"
    t.datetime "updated_at", null: false
    t.index ["direct_key"], name: "index_conversations_on_direct_key", unique: true
  end

  create_table "denylist_patterns", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.datetime "created_at", null: false
    t.string "label", null: false
    t.string "pattern", null: false
    t.datetime "updated_at", null: false
  end

  create_table "event_candidates", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "event_type"
    t.string "external_id"
    t.string "external_url"
    t.string "location"
    t.boolean "online", default: false, null: false
    t.string "organizer"
    t.text "raw_data"
    t.string "source", default: "eventbrite", null: false
    t.datetime "starts_at", precision: nil
    t.string "status", default: "pending", null: false
    t.integer "subject_id"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["source", "external_id"], name: "idx_event_candidates_source_external", unique: true
    t.index ["status"], name: "idx_event_candidates_status"
  end

  create_table "events", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.datetime "ends_at", precision: nil
    t.string "event_type"
    t.string "external_id"
    t.string "external_url"
    t.string "location"
    t.boolean "online", default: false, null: false
    t.string "organizer"
    t.string "source", default: "eventbrite", null: false
    t.datetime "starts_at", precision: nil
    t.integer "subject_id"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["starts_at"], name: "idx_events_starts_at"
    t.index ["subject_id"], name: "idx_events_subject_id"
  end

  create_table "likes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["post_id", "user_id"], name: "index_likes_on_post_id_and_user_id", unique: true
    t.index ["post_id"], name: "index_likes_on_post_id"
    t.index ["user_id"], name: "index_likes_on_user_id"
  end

  create_table "mentor_subjects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "subject_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["subject_id"], name: "index_mentor_subjects_on_subject_id"
    t.index ["user_id", "subject_id"], name: "index_mentor_subjects_on_user_id_and_subject_id", unique: true
    t.index ["user_id"], name: "index_mentor_subjects_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.text "body", null: false
    t.integer "conversation_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["conversation_id"], name: "index_messages_on_conversation_id"
    t.index ["user_id"], name: "index_messages_on_user_id"
  end

  create_table "post_tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "post_id", null: false
    t.integer "tag_id", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id", "tag_id"], name: "index_post_tags_on_post_id_and_tag_id", unique: true
    t.index ["post_id"], name: "index_post_tags_on_post_id"
    t.index ["tag_id"], name: "index_post_tags_on_tag_id"
  end

  create_table "posts", force: :cascade do |t|
    t.text "ai_summary"
    t.text "body", null: false
    t.integer "bookmarks_count", default: 0, null: false
    t.string "code_language", default: "plaintext"
    t.text "code_snippet"
    t.integer "comments_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.string "education_level"
    t.boolean "flagged_for_moderation", default: false, null: false
    t.integer "likes_count", default: 0, null: false
    t.boolean "mentor_help_requested", default: false, null: false
    t.integer "status", default: 0, null: false
    t.integer "subject_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.boolean "urgent", default: false, null: false
    t.integer "user_id", null: false
    t.index ["subject_id"], name: "index_posts_on_subject_id"
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "resource_tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "resource_id", null: false
    t.integer "tag_id", null: false
    t.datetime "updated_at", null: false
    t.index ["resource_id", "tag_id"], name: "index_resource_tags_on_resource_id_and_tag_id", unique: true
    t.index ["resource_id"], name: "index_resource_tags_on_resource_id"
    t.index ["tag_id"], name: "index_resource_tags_on_tag_id"
  end

  create_table "resources", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.integer "status", default: 0, null: false
    t.integer "subject_id"
    t.string "title"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["subject_id"], name: "index_resources_on_subject_id"
    t.index ["user_id"], name: "index_resources_on_user_id"
  end

  create_table "subject_requests", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.string "status", default: "pending", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_subject_requests_on_user_id"
  end

  create_table "subjects", force: :cascade do |t|
    t.string "accent_color", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "icon", null: false
    t.string "name", null: false
    t.integer "posts_count", default: 0, null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_subjects_on_slug", unique: true
  end

  create_table "tags", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.string "slug", null: false
    t.datetime "updated_at", null: false
    t.index ["slug"], name: "index_tags_on_slug", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.text "bio"
    t.datetime "cgu_accepted_at"
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.string "education_level"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "full_name"
    t.string "headline"
    t.boolean "mentor", default: false, null: false
    t.boolean "notify_on_comment", default: true, null: false
    t.boolean "notify_on_message", default: true, null: false
    t.decimal "rating", precision: 2, scale: 1, default: "4.8", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.string "role", default: "user", null: false
    t.string "unconfirmed_email"
    t.datetime "updated_at", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "bookmarks", "posts"
  add_foreign_key "bookmarks", "users"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "conversation_participants", "conversations"
  add_foreign_key "conversation_participants", "users"
  add_foreign_key "likes", "posts"
  add_foreign_key "likes", "users"
  add_foreign_key "mentor_subjects", "subjects"
  add_foreign_key "mentor_subjects", "users"
  add_foreign_key "messages", "conversations"
  add_foreign_key "messages", "users"
  add_foreign_key "post_tags", "posts"
  add_foreign_key "post_tags", "tags"
  add_foreign_key "posts", "subjects"
  add_foreign_key "posts", "users"
  add_foreign_key "resource_tags", "resources"
  add_foreign_key "resource_tags", "tags"
  add_foreign_key "resources", "subjects"
  add_foreign_key "resources", "users"
  add_foreign_key "subject_requests", "users"
end
