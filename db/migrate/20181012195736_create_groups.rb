class CreateGroups < ActiveRecord::Migration[5.2]
  def change
    create_table :groups do |t|
      t.boolean :alive
      t.integer :x
      t.integer :y
      t.integer :game_id

      t.timestamps
    end
  end
end
