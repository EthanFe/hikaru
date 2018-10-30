Rails.application.routes.draw do
  resources :players, only: [:index, :show, :new, :create]
  get "login", to: "players#login_page", as: "login_page"
  post "login", to: "players#login", as: "login"
  post "logout", to: "players#logout", as: "logout"

  # resources :messages
  # resources :chats
  # resources :moves

  resources :games, only: [:index, :show, :new, :create] #do
  #   member do
  #     post 'play'
  #   end
  # end

  warp_resources :gamestates
  warp_resources :gameslist
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
