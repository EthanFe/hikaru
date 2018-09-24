class CreateMoves < ActiveRecord::Migration[5.2]
  def change
    create_table :moves do |t|
      t.integer :game_id
      t.integer :player_id
      t.integer :parent_move_id
      t.integer :x
      t.integer :y

      t.timestamps
    end
  end
end
