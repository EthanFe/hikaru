class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: :play

	def play(params)
		if params[:x] && params[:y]
			move_result = @game.play_move(params[:x], params[:y])
			if move_result["result"] == "success"
				game_state = move_result["state"]
				response = GamestatesWarpController.gamestate_json_packet(game_state, @game, move_result["result"])
				yield response
			else
				response = {"move_result": move_result["result"]}.to_json
				yield response
			end
		else
			game_state = @game.get_board_state_by_groups(@game.last_move)
			response = GamestatesWarpController.gamestate_json_packet(game_state, @game)
			yield response
		end

		Game.after_commit do
			@game = Game.find(params[:id])
			game_state = @game.get_board_state_by_groups(@game.last_move)
			response = GamestatesWarpController.gamestate_json_packet(game_state, @game)
			yield response
		end
	end

	def self.gamestate_json_packet(game_state, game, move_result = nil)
		{"board": game_state, "next_player": game.active_player, "last_move": game.last_move, "move_result": move_result}.to_json
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end