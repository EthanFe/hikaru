class Player < ApplicationRecord
	has_many :moves

	def play_move(move)
		self.moves << move
	end
end
