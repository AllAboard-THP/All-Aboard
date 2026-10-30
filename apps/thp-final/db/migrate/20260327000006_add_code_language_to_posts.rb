class AddCodeLanguageToPosts < ActiveRecord::Migration[8.1]
  def change
    add_column :posts, :code_language, :string, default: "plaintext"
  end
end
