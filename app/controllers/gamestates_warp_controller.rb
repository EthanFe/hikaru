class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: :play

	def play(params)
		if params[:x] && params[:y]
			move_result = @game.play_move(params[:x], params[:y])
			if move_result["result"] == "success"
				response = {"move_result": move_result["result"], "board": move_result["state"], "next_player": @game.active_player, "last_move": @game.last_move}.to_json
				yield response
			else
				response = {"move_result": move_result["result"]}.to_json
				yield response
			end
		else
			game_state = @game.get_board_state_by_groups(@game.last_move)
			response = {"board": game_state, "next_player": @game.active_player, "last_move": @game.last_move}.to_json
			yield response
		end

		Game.after_commit do
			@game = Game.find(params[:id])
			game_state = @game.get_board_state_by_groups(@game.last_move)
			response = {"board": game_state, "next_player": @game.active_player, "last_move": @game.last_move}.to_json
			yield response
		end
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end