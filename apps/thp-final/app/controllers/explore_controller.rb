class ExploreController < ApplicationController
  before_action :authenticate_user!

  def index
    @subjects = Subject.order(posts_count: :desc, name: :asc)
  end
end
