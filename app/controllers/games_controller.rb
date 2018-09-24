require 'json'
class GamesController < ApplicationController
	def index
		@games = Game.all
	end

	def show
		@game = Game.find(params[:id])
	end

	def js
		# Move.find(id:move_id)
		# render :json => {"data": "real data. we assure you this is not fake."}
	end

end
=begin
class SongsController < ApplicationController
	def new
    @song = Song.new
	end

	def create
		@song = Song.new(song_params)
		
    if @song.save
			redirect_to song_path(@song)
    else
      render :new
    end
	end

	def show
		@song = Song.find(params[:id])
	end

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

	def index
		@songs = Song.all
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