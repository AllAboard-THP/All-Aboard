class Mentor::BaseController < ApplicationController
  before_action :authenticate_mentor!
end
