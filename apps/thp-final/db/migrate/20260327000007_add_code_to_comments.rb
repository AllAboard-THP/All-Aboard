class AddCodeToComments < ActiveRecord::Migration[8.1]
  def change
    add_column :comments, :code_snippet, :text
    add_column :comments, :code_language, :string, default: "plaintext"
  end
end
