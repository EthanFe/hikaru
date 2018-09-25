require 'json'
require 'pry'
class GamesController < ApplicationController
	skip_before_action :verify_authenticity_token # real secure boys
	before_action :find_game_object, only: [:show, :play]

	def index
		@games = Game.all
	end

	def show

	end

	def play
		if @game.play_move(params[:x], params[:y])
			render json: {"successful_move": "true", "board": @game.json_game_state}
		else
			render json: {"successful_move": "false", "board": @game.json_game_state}
		end
	end

	def new
		@game = Game.new
	end

	def create
		params[:size] = 9
		params[:active_player] = 1
		@game = Game.new(params.require(:game).permit(:name, :player_1, :player_2, :size, :active_player))
		
    if @game.save
			redirect_to game_path(@game)
		else
      render :new
    end
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end
=begin
class SongsController < ApplicationController

	def edit
		@song = Song.find(params[:id])
	end

	def update
		@song = Song.find(params[:id])
		
    if @song.update(song_params)
			redirect_to song_path(@song)
    else
      render :edit
    end
	end

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