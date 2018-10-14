class Group < ApplicationRecord
  belongs_to :game

	def toggle_aliveness
		self.update(alive: !self.alive)
	end

	def self.most_recent_group
		self.all.sort_by { |group| group.updated_at }.last
	end
end
