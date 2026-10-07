Rails.application.routes.draw do
  mount ActionCable.server => "/cable"
  devise_for :users, controllers: { confirmations: "users/confirmations", registrations: "users/registrations" }

  authenticated :user do
    root "feed#index", as: :authenticated_root
  end

  unauthenticated do
    root "home#index"
  end

  get "feed"         => "feed#index"
  get "explore"      => "explore#index"
  get "my-posts"     => "my_posts#index"
  get "my-bookmarks" => "my_bookmarks#index", as: :my_bookmarks

  resources :users, only: :show

  resources :posts, only: [:create, :show, :edit, :update] do
    member do
      post :delete
      post :track_view
      post :help_mentor
    end
    collection do
      post :suggest_tags
    end
  end

  resources :comments, only: [:create, :show, :update] do
    member do
      post :delete
      get :edit
    end
  end

  resources :likes, only: :create do
    member do
      post :delete
    end
  end

  resources :bookmarks, only: :create do
    member do
      post :delete
    end
  end

  resources :subject_requests, only: :create do
    member do
      post :delete
      post :update
    end
  end

  resources :conversations, path: "messages", only: [:index, :show, :create] do
    resources :messages, only: [:create, :show, :update] do
      member do
        post :delete
        get :edit
      end
    end
  end

  resources :resources, only: [:index, :show, :new, :create, :edit, :update, :destroy]

  resources :events, only: [:index, :show]

  namespace :mentor do
    get "dashboard", to: "dashboard#index", as: :dashboard
    resources :resources, only: [:index] do
      member do
        post :approve
        post :reject
      end
    end
  end

  namespace :admin do
    get "dashboard", to: "dashboard#index"
    get  "moderation",                          to: "moderation#index",           as: :moderation
    post "moderation/posts/:id/approve",        to: "moderation#approve_post",    as: :approve_moderation_post
    post "moderation/posts/:id/reject",         to: "moderation#reject_post",     as: :reject_moderation_post
    post "moderation/comments/:id/approve",     to: "moderation#approve_comment", as: :approve_moderation_comment
    post "moderation/comments/:id/reject",      to: "moderation#reject_comment",  as: :reject_moderation_comment
    resources :denylist_patterns, only: [:index, :create, :destroy] do
      member { post :toggle }
    end
    resources :posts,            only: [:index, :destroy]
    resources :users,            only: :index do
      member do
        post :promote_user
        post :promote_mentor
      end
    end
    resources :messages,         only: [:new, :create]
    resources :admins,           only: [:new, :create]
    resources :subject_requests, only: [:index, :update]
    resources :resources,        only: [:index] do
      member do
        post :approve
        post :reject
      end
    end
    resources :event_candidates, only: [:index] do
      collection { post :fetch }
      member do
        post :approve
        post :reject
      end
    end
    resources :events, only: [:new, :create, :destroy]
  end

  resource :admin_setup, only: [:new, :create], path: "admin-setup"

  get  "legal/cgu",      to: "legal#cgu",       as: :legal_cgu
  get  "legal/privacy",  to: "legal#privacy",    as: :legal_privacy
  get  "legal/mentions", to: "legal#mentions",   as: :legal_mentions
  post "legal/accept",   to: "legal#accept_cgu", as: :accept_cgu

  get "up" => "rails/health#show", as: :rails_health_check
end
