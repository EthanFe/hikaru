class Group < ApplicationRecord
  belongs_to :game

	def toggle_aliveness
		self.update(alive: !self.alive)
	end
end
