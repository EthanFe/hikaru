class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: [:play, :game_state, :historic_game_state]

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

	def historic_game_state(params)
		last_move = Move.find(params[:move_id])
		game_state = @game.get_board_state_by_groups(last_move)
		response = GamestatesWarpController.gamestate_json_packet(game_state, @game, nil, last_move)
		yield response
	end

	def self.gamestate_json_packet(game_state, game, move_result = nil, last_move = game.last_move)
		{	"board": game_state,
			"next_player": game.active_player_at_move(last_move), 
			"last_move": last_move,
			"history": game.last_move ? game.history(game.last_move) : nil,
			"move_result": move_result
		}.to_json
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end