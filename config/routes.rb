Rails.application.routes.draw do
  resources :players, only: :show
  # resources :messages
  # resources :chats
  # resources :moves
  resources :games, only: [:index, :show] do
    member do
      get 'play'
    end
  end

  # get '/sample-request/:move_id', to: 'games#js'
  
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
