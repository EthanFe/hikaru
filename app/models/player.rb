class Player < ApplicationRecord
	validates :name, presence: true
	validates :name, uniqueness: true

	has_many :moves

	def play_move(move)
		self.moves << move
	end

	def games
		Game.all.where(player1_id: self.id) | Game.all.where(player2_id: self.id)
	end
end
