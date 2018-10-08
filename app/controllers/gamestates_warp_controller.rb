class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: [:play, :game_state]

	def play(params)
		move_result = @game.play_move(params[:x], params[:y])
		game_state = move_result["state"]
		response = GamestatesWarpController.gamestate_json_packet(game_state, @game, move_result["result"])
		yield response
	end

	def game_state(params)
		Game.after_commit do
			@game = Game.find(params[:id])
			game_state = @game.get_board_state_by_groups(@game.last_move)
			response = GamestatesWarpController.gamestate_json_packet(game_state, @game)
			yield response
		end

		# also respond immediately with the current state
		game_state = @game.get_board_state_by_groups(@game.last_move)
		response = GamestatesWarpController.gamestate_json_packet(game_state, @game)
		yield response
	end

	def self.gamestate_json_packet(game_state, game, move_result = nil)
		{	"board": game_state,
			"next_player": game.active_player, 
			"last_move": game.last_move,
			"history": game.history(game.last_move),
			"move_result": move_result
		}.to_json
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end