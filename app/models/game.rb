class Game < ApplicationRecord
	has_many :moves

	# Creation form/validation shit
	# -----------------
	
	validates :name, presence: true
	validate :player_ids_are_valid
	validate :players_are_different
	
	def player_ids_are_valid
		unless player1_id && Player.find(player1_id).is_a?(Player) && 
					 player2_id && Player.find(player2_id).is_a?(Player)
			errors[:player1_id] << 'Game needs two valid players'
		end
	end

	def players_are_different
		if player1_id == player2_id
			errors[:player1_id] << 'Players need to be different'
		end
	end

	# these methods suck and i wanna kill them
	def player_1
	end

	def player_2
	end


	# Useful shit
	# -----------------

	def players
		[Player.find(player1_id), Player.find(player2_id)]
	end

	def move_count
		self.moves.length
	end

	def play_move(x, y)
		# players[active_player].id is probably a bit redundant as far as db calls
		if space_is_empty(x, y)
			move = self.moves.create(game_id: self.id, player_id: players[active_player].id, parent_move_id: last_move, x: x, y: y)
			players[active_player].play_move(move)
			self.update(active_player: self.active_player == 0 ? 1 : 0)
			true
		else
			false
		end
	end

	def space_is_empty(x, y)
		!self.moves.all.any? do |move|
			move.x == x && move.y == y
		end
	end

	def last_move
		self.moves.all.sort_by { |move| move.created_at }.last
	end

	def json_game_state
		stones = {"white" => [],
							"black" => []}
		self.moves.each do |move|
			if move.player == self.players[0]
				stones["white"] << [move.x, move.y]
			elsif move.player == self.players[1]
				stones["black"] << [move.x, move.y]
			end
		end
		stones
	end
end
