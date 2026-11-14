module Taggable
  extend ActiveSupport::Concern

  def sync_tags!(raw_tags)
    names = raw_tags.to_s.split(",").map(&:strip).reject(&:blank?).uniq.first(6)
    self.tags = names.map do |name|
      Tag.find_or_create_by!(slug: name.parameterize) { |t| t.name = name }
    end
  end
end
