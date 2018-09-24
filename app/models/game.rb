class Game < ApplicationRecord
	has_many :moves
	def players
		[Player.find(player1_id), Player.find(player2_id)]
	end

	def move_count
		self.moves.length
	end
end
