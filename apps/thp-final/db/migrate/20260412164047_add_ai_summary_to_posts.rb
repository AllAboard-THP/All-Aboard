class AddAiSummaryToPosts < ActiveRecord::Migration[8.1]
  def change
    add_column :posts, :ai_summary, :text
  end
end
