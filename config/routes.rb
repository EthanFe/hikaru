Rails.application.routes.draw do
  resources :players, only: [:index, :show]
  # resources :messages
  # resources :chats
  # resources :moves

  resources :games, only: [:index, :show, :new, :create] #do
  #   member do
  #     post 'play'
  #   end
  # end

  post 'games/:id/play', to: 'games#play'

  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
