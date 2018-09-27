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
			move = self.moves.create(game_id: self.id, player_id: players[active_player].id, parent_move_id: last_move_id, x: x, y: y)
			players[active_player].play_move(move)
			self.update(active_player: self.active_player == 0 ? 1 : 0) # switch active player
			get_board_state_by_groups(move)
		else
			false
		end
	end

	def get_board_state_by_groups(move)
		find_groups(get_board_state(move))
	end

	def get_board_state(move)
		board = {}
		move.full_move_chain.each do |past_move|
			board[past_move.coords] = get_move_color(past_move)
			board = kill_surrounded_stones(board)
		end
		board
	end

	def get_move_color(move)
		if move.player == self.players[0]
			"white"
		elsif move.player == self.players[1]
			"black"
		end
	end

	def kill_surrounded_stones(board)
		groups = find_groups(board)
		groups.each do |group|
			# don't let the group of the most recently placed stone die before other groups are killed
			if breaths(group, board) == 0 && !group.include?([last_move.x, last_move.y])
				board = kill_group(group, board)
			end
		end
		board
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

	def kill_group(group, board)
		puts "STONES IN GROUP: #{group.length}"
		group.each do |stone|
			board.delete([stone[0][0], stone[0][1]])
			puts "DELETING STONE AT #{stone[0][0]}, #{stone[0][1]}"
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

	# def current_stones(last_move)
	# 	all_moves = last_move.full_move_chain
	# end

	def space_is_empty(x, y)
		#!last move means if no moves have been played
		!last_move || get_board_state(last_move)[[x, y]] == nil
	end

	def last_move
		self.moves.all.sort_by { |move| move.created_at }.last
	end

	def last_move_id
		last_move ? last_move.id : nil
	end
end
