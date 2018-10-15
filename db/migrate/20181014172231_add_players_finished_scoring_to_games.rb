class AddPlayersFinishedScoringToGames < ActiveRecord::Migration[5.2]
  def change
    add_column :games, :player1_finished_scoring, :boolean
    add_column :games, :player2_finished_scoring, :boolean
  end
end
