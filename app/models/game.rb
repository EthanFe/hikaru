class Game < ApplicationRecord
	has_many :moves

	# Creation form/validation shit
	# -----------------
	
	validates :name, presence: true
	validates :size, presence: true
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
			move = self.moves.build(game_id: self.id, player_id: players[active_player].id, parent_move_id: last_move_id, x: x, y: y)
			board_state = (get_board_state(move))[:board]
			if board_state[[x, y]] == get_move_color(move) # if our placed stone is still alive and well, aka wasnt suicidal
				move.save
				players[active_player].play_move(move)
				self.update(active_player: self.active_player == 0 ? 1 : 0) # switch active player
				{"result" => "success", "state" => find_groups(board_state)}
			else
				{"result" => "suicidal"}
			end
		else
			{"result" => "occupied"}
		end
	end

	def get_board_state_by_groups(move)
		find_groups(get_board_state(move)[:board])
	end

	def get_board_state(move)
		board = {}
		if move
			killed_stones = []
			move.full_move_chain.each do |past_move|
				board[past_move.coords] = get_move_color(past_move)
				killed_stones = find_surrounded_stones(board)
				board = kill_stones(killed_stones, board)
			end
		end
		{board: board, killed_stones: killed_stones}
	end

	def get_move_color(move)
		if move.player == self.players[0]
			"white"
		elsif move.player == self.players[1]
			"black"
		end
	end

	def find_surrounded_stones(board)
		surrounded_stones = []
		groups = find_groups(board)
		groups.each do |group|
			# don't let the group of the most recently placed stone die before other groups are killed
			if breaths(group, board) == 0 && !group.include?([last_move.x, last_move.y])
				surrounded_stones.concat(group)
			end
		end
		surrounded_stones
	end

	def breaths(group, board)
		breath_spaces = {}
		group.each do |position, color|
			direction_offsets.each do |offset|
				adjacent_space = [position[0] + offset[0], position[1] + offset[1]]
				if board[adjacent_space] == nil && within_bounds(adjacent_space)
					breath_spaces[adjacent_space] = true
				end
			end
		end
		breath_spaces.length
	end

	def direction_offsets
		[[0,1], [0,-1], [1, 0], [-1, 0]]
	end

	def within_bounds(coords)
		coords[0] >= 0 && coords[0] < self.size && coords[1] >= 0 && coords[1] < self.size
	end

	def kill_stones(stones, board)
		# puts "STONES IN GROUP: #{group.length}"
		stones.each do |stone|
			board.delete([stone[0][0], stone[0][1]])
			# puts "DELETING STONE AT #{stone[0][0]}, #{stone[0][1]}"
		end
		board
	end

	def find_groups(board)
		groups = []
		board.each do |stone|
			joined_group = nil
			groups.each do |group|
				# search through groups to see if stone is connected to an existing group
				if is_connected_to_group(stone, group)
					# if finding any group for stone to attach to
					if !joined_group
						group << stone
						joined_group = group
					# if already found a group and found an additional group to join up with, merge the two groups
					else
						joined_group.push(*group)
						groups.delete(group)
					end
				end
			end
			# if not next to any groups, make a new group consisting of this stone
			groups << [stone] unless joined_group
		end
		groups
	end

	def is_connected_to_group(stone, group)
		group.any? do |group_member|
			stones_are_connected(group_member, stone)
		end
	end

	def stones_are_connected(stone1, stone2)
		position1 = stone1[0]
		position2 = stone2[0]
		color1 = stone1[1]
		color2 = stone2[1]
		color1 == color2 && # stones are the same player's
		((position1[0] == position2[0] && (position1[1] == position2[1] - 1 || position1[1] == position2[1] + 1)) || # x is equal, y is +/- 1
		(position1[1] == position2[1] && (position1[0] == position2[0] - 1 || position1[0] == position2[0] + 1))) # y is equal, x is +/- 1
	end

	def space_is_empty(x, y)
		#!last move means if no moves have been played
		!last_move || ((get_board_state(last_move))[:board])[[x, y]] == nil
	end

	def last_move
		self.moves.all.sort_by { |move| move.created_at }.last
	end

	def last_move_id
		last_move ? last_move.id : nil
	end

	def history(move)
		if move
			move.full_move_chain.map do |move|
				gamestate_at_move(move)
			end
		else
			[]
		end
	end

	def gamestate_at_move(move)
		state = { "board": get_board_state_by_groups(move),
							"next_player": active_player_at_move(move), 
							"last_move": move,
							"killed_stones": get_board_state(move)[:killed_stones]	}
		# theres probably a cleaner way to do this but w/e
		# just trimming down data & getting the move color so client has an easier time
		state[:last_move] = {x: state[:last_move].x,
												 y: state[:last_move].y,
												 color: get_move_color(state[:last_move])}
		state
	end

	def active_player_at_move(move)
		if move.player == self.players[0]
			1
		elsif move.player == self.players[1]
			0
		end
	end
end
