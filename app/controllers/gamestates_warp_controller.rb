class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: [:play, :full_game_state]

	def play(params)
		if params[:x] && params[:y]
			move_result = @game.play_move(params[:x], params[:y])
			yield move_result["result"]
		else
			yield @game.pass_turn()["result"]
		end
	end

	# including all history, for fresh page loads
	def full_game_state(params)
		game_status = @game.has_ended ? "scoring" : "active"
		response = {"game_status": game_status, "history": @game.history(@game.last_move)}
		if @game.has_ended
			response["groups"] = @game.endgame_groups
		end
		yield response
	end

	# including only state resulting from latest move, for after a move is played
	def latest_game_state(params)
		Game.after_commit do
			@game = Game.find_by(id: params[:id])
			if @game
				yield game_state = @game.gamestate_at_move(@game.last_move)
			end
		end
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end