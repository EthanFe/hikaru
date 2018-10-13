class Move < ApplicationRecord
	belongs_to :player

	def full_move_chain
		chain = [self]
		current_move = self
		while current_move.parent_move
			chain << current_move.parent_move
			current_move = current_move.parent_move
		end
		chain.reverse
	end

	def parent_move
		parent_move_id ? Move.find(parent_move_id) : nil
	end

	def coords
		[x, y]
	end

	def is_pass
		coords == [nil, nil]
	end

	def is_in_group(group)
		group.any? do |stone|
			stone[0] == self.coords
		end
	end

	def self.most_recent_move
		self.all.sort_by { |move| move.created_at }.last
	end
end
