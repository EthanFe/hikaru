# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

ethan = Player.create(name: "Ethan")
nate = Player.create(name: "Nate")
Chat.create()
Game.create(name: "testgame", chat_id: Chat.first.id, player1_id: ethan.id, player2_id: nate.id, active_player: 1, size: 9)