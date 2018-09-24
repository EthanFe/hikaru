class CreateGames < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.string :name
      t.integer :chat_id
      t.integer :player1_id
      t.integer :player2_id
      t.integer :active_player
      t.integer :size

      t.timestamps
    end
  end
end
