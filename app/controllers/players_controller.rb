class PlayersController < ApplicationController
	def index
		@players = Player.all
	end

	def new
		@player = Player.new
	end

	def create
		@player = Player.new(params.require(:player).permit(:name))
		
    if @player.save
			redirect_to player_path(@player)
		else
      render :new
    end
	end

	def show
		@player = Player.find(params[:id])
	end
end
