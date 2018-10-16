//Subscribe and Trigger are now methods of api 
// const api = WarpCable("wss://e600e2e3.ngrok.io/cable")
const api = WarpCable("ws:localhost:3000/cable")
const TILE_SIZE = 64
let HISTORY_LIST = []
let currentlyDisplayedMove = null
let game_status = null

document.addEventListener("turbolinks:load", function() {
	game_id = parseInt(document.URL.split("/games/")[1])

	// get gamestate so far
	api.trigger('Gamestates', 'full_game_state', {id: game_id}, data => {
		console.log("Got full game state up to now")
		setGameMode(data.game_status)
		HISTORY_LIST = data.history
		updateScreen(HISTORY_LIST, null, data.groups, data.score, data.players_finished_scoring)
	})

	// subscribe to state updates from now on
	api.subscribe('Gamestates', 'latest_game_state', {id: game_id}, data => {
		console.log("Got latest game state update from new move")
		addNewMove(data)
		updateScreen(HISTORY_LIST)
	})

	// subscribe to endgame group aliveness updates
	api.subscribe('Gamestates', 'latest_endgame_state', {id: game_id}, data => {
		console.log("Got group aliveness update")
		setGameMode(data.game_status)
		updateScreen(HISTORY_LIST, null, data.groups, data.score, data.players_finished_scoring)
	})

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);
	document.getElementById("pass_button").addEventListener('click', () => passTurn(), false);
	document.getElementById("finish_scoring_button").addEventListener('click', () => finishScoring(), false);
});

function setGameMode(new_game_status) {
	game_status = new_game_status
	if (game_status == "active") {

	} else if (game_status == "scoring") {
		document.getElementById("pass_button").classList.add("invisible")

		document.getElementById("scoring").classList.remove("invisible")
		document.getElementById("player1_finished_scoring").classList.remove("invisible")
		document.getElementById("player2_finished_scoring").classList.remove("invisible")
	} else if (game_status == "completed") {
		document.getElementById('next_move_text').classList.add("invisible")
		document.getElementById('stones_captured_text').classList.add("invisible")
		document.getElementById('pass_button').classList.add("invisible")

		document.getElementById("scoring").classList.add("invisible")
		document.getElementById("player1_finished_scoring").classList.add("invisible")
		document.getElementById("player2_finished_scoring").classList.add("invisible")

		document.getElementById('final_score').classList.remove("invisible")
	}
}

function addNewMove(data) {
	HISTORY_LIST.push(data)
}

function getCursorPosition(canvas, event) {
	const x = event.pageX - canvas.offsetLeft,
				y = event.pageY - canvas.offsetTop;
	
	return [Math.floor(x / realTileSize(canvas)), Math.floor(y / realTileSize(canvas))];
}

function realTileSize(canvas) {
	return (canvas.offsetWidth / canvas.width) * TILE_SIZE
}