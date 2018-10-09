class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: [:play, :full_game_state]

	def play(params)
		move_result = @game.play_move(params[:x], params[:y])
		yield move_result["result"]
	end

	# including all history, for fresh page loads
	def full_game_state(params)
		yield @game.history(@game.last_move)
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