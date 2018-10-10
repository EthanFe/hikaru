class PlayersController < ApplicationController
	def index
		@players = Player.all
	end

	def new
		@player = Player.new
	end

	def create
		# is validating passwords here and then validating other things using activerecord weird?
		# it feels kinda weird
		if params[:password] != "" && params[:password] == params[:password_confirmation]
			@player = Player.new(params.require(:player).permit(:name, :password, :password_confirmation))
			
			if @player.save
        session[:player_id] = @player.id
				redirect_to player_path(@player)
			else
        flash[:notice] = "validations failed!"
				redirect_to action: "new"
			end
    else
      flash[:notice] = "passwords didn't match"
      redirect_to action: "new"
		end
	end

	def show
		@player = Player.find(params[:id])
	end

	def login_page
		render :login
	end

	def login
		@player = Player.find_by(name: params[:username])
		if @player && @player.authenticate(params[:password])
      session[:player_id] = @player.id
      flash[:notice] = "Successfully logged in!"
      redirect_to player_path(@player) #:controller => 'rounds', :action => 'new'
		else
			flash[:notice] = "Invalid login"
      redirect_to :login_page
    end
	end

  def logout
    session[:player_id] = nil
    flash[:notice] = "Successfully logged out"
    redirect_to :login_page
  end
end
