require 'json'
require 'pry'
class GamesController < ApplicationController
	skip_before_action :verify_authenticity_token # real secure boys
	before_action :find_game_object, only: [:show, :play, :board_state]

	def index
		@games = Game.all
	end

	def show
		@canvas_size = @game.size * 64
	end

	def play
		game_state = @game.play_move(params[:x], params[:y])

		if game_state
			render json: {"successful_move": "true", "board": game_state, "next_player": @game.active_player, "last_move": @game.last_move}
		else
			render json: {"successful_move": "false"}
		end
	end

	def new
		@game = Game.new
	end

	def create
		player1 = Player.find_by(name: params[:game][:player_1])
		player2 = Player.find_by(name: params[:game][:player_2])
		player1_id = player1.id if player1
		player2_id = player2.id if player2
		@game = Game.new(name: params[:game][:name], player1_id: player1_id, player2_id: player2_id, size: params[:game][:size], active_player: 1)
		
		if @game.save
			redirect_to game_path(@game)
		else
      render :new
    end
	end

	def board_state
		game_state = @game.get_board_state_by_groups(@game.last_move)
		render json: {"board": game_state, "next_player": @game.active_player, "last_move": @game.last_move}
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end
=begin
class SongsController < ApplicationController

	def destroy
		Song.find(params[:id]).destroy

		redirect_to songs_path
	end

	private

  def song_params
    params.require(:song).permit(:title, :released, :release_year, :artist_name, :genre)
  end
end
=end