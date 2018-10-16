class GamestatesWarpController < WarpCable::Controller
	before_action :find_game_object, only: [:play, :full_game_state, :toggle_aliveness, :finish_scoring]

	# CLIENT ACTION METHODS
	# Triggered when client performs an action modifying state

	def play(params)
		if params[:x] && params[:y]
			move_result = @game.play_move(params[:x], params[:y])
			yield move_result["result"]
		else
			# if no coords are provided, turn was passed
			yield @game.pass_turn()["result"]
		end
	end

	def toggle_aliveness(params)
		endgame_group = @game.group_for_coords(params[:x], params[:y])
		if endgame_group
			endgame_group.toggle_aliveness
			yield endgame_group.alive
		end
	end

	def finish_scoring(params)
		@game.finish_scoring
	end

	# NEW PAGE OPENED METHODS

	# including all history, for fresh page loads
	def full_game_state(params)
		response = {"game_status": @game.get_status, "history": @game.history(@game.last_move)}
		if @game.has_ended
			response["groups"] = @game.endgame_groups
			response["players_finished_scoring"] = @game.players_finished_scoring
			if @game.scoring_ended
				response["score"] = @game.score
			end
		end
		yield response
	end

	# UPDATE ALL CLIENTS METHODS
	# Called after state has been changed, to notify all other clients of the new state

	# including only state resulting from latest move, for after a move is played
	def latest_game_state(params)
		Move.after_create do
			if Move.most_recent_move.game_id == params[:id]
				@game = Game.find_by(id: params[:id])
				if @game
					yield @game.gamestate_at_move(@game.last_move)
				end
			end
		end
	end

	# update when endgame groups aliveness are toggled
	def latest_endgame_state(params)
		Group.after_update do
			if Group.most_recent_group.game_id == params[:id]
				@game = Game.find_by(id: params[:id])
				if @game
					response = {"groups": @game.endgame_groups,
											"players_finished_scoring": @game.players_finished_scoring,
											"game_status": @game.get_status}
					if @game.scoring_ended
						response["score"] = @game.score
					end
					yield response
				end
			end
		end
	end

	private

	def find_game_object
		@game = Game.find(params[:id])
	end
end