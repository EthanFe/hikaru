class GameslistWarpController < WarpCable::Controller
  def games_list(params)
    Game.after_create do
      response = {games: Game.all}
      yield response
    end
    
    response = {games: Game.all}
    yield response
  end
end