//Subscribe and Trigger are now methods of api 
// const api = WarpCable("wss://ec010beb.ngrok.io/cable")
const api = WarpCable("ws:localhost:3000/cable")
const TILE_SIZE = 64
let HISTORY_LIST = []
let currentlyDisplayedMove = null

document.addEventListener("turbolinks:load", function() {
	game_id = parseInt(document.URL.split("/games/")[1])

	// get gamestate so far
	api.trigger('Gamestates', 'full_game_state', {id: game_id}, data => {
		console.log("Got full game state up to now")
		HISTORY_LIST = data
		updateScreen(data)
	})

	// subscribe to state updates from now on
	api.subscribe('Gamestates', 'latest_game_state', {id: game_id}, data => {
		console.log("Got latest game state update from new move")
		addNewMove(data)
		updateScreen(HISTORY_LIST)
	})

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);
});

function addNewMove(data) {
	HISTORY_LIST.push(data)
}

function updateScreen(data) {
	latest_state = data[data.length - 1]
	updateErrorText("")
	// if no moves have been played, display a default state
	if (latest_state === undefined) {
		latest_state = {
			"board": [],
			"next_player": 1,
			"last_move": null
		}
	}
	reDrawBoard(latest_state["board"])
	displayKilledStones(latest_state["killed_stones"])
	updateNextMoveText(latest_state["next_player"])
	if (latest_state["last_move"] != null)
		highlightLastMovePlayed(latest_state["last_move"], latest_state["next_player"])

	currentlyDisplayedMove = HISTORY_LIST.indexOf(latest_state)
	console.log(currentlyDisplayedMove)

	displayHistoryList()
}

function displayHistoryList() {
	if (HISTORY_LIST.length > 0) {
		historyListElement = document.getElementById('history_list')
		historyListElement.innerHTML = ""
		for (const [index, gameState] of HISTORY_LIST.entries()) {
			const imgSource = "/assets/tile_with_white-404735ee1942c50f532ae101578a0a0d37e5851e8533fa92218e94282817ad77.png"
			let move = gameState.last_move
			let killedStonesText = gameState.killed_stones.length > 0 ? `, capturing ${gameState.killed_stones.length} stones` : ""
			historyListElement.innerHTML += `<li ${currentlyDisplayedMove == index ? "class=active_move" : ""}><img width=32 height=32 src=${imgSource} onclick="displayStateFromMove(${index})"/>${move.color} played at ${move.x}, ${move.y}${killedStonesText}</li>`
		}
	}
}

function displayStateFromMove(move_id) {
	console.log("Displaying historic state for move id " + move_id)
	// put the old game state in a single-entry array so updateScreen thinks its a list of moves
	// good code.
	updateScreen([HISTORY_LIST[move_id]])
}

function highlightLastMovePlayed(last_move, next_player) {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.strokeStyle = next_player == 0 ? "white" : "black";
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.arc(last_move["x"] * TILE_SIZE + TILE_SIZE / 2, last_move["y"] * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 4, 0, Math.PI * 2, true); // Outer circle
		ctx.moveTo(110, 75);
		ctx.stroke();
	}
}

function clickOnBoard(canvas, event) {
	clickedSquareIndices = getCursorPosition(canvas, event)
	console.log(clickedSquareIndices);

	game_id = parseInt(document.URL.split("/games/")[1])
	// send request to the server to play the move
	api.trigger('Gamestates', 'play', {id: game_id, x: clickedSquareIndices[0], y: clickedSquareIndices[1]}, data => {
		console.log("Played move and got response")
		updateErrorText(data)
	})
}

function getCursorPosition(canvas, event) {
	const x = event.pageX - canvas.offsetLeft,
				y = event.pageY - canvas.offsetTop;
	
	return [Math.floor(x / realTileSize(canvas)), Math.floor(y / realTileSize(canvas))];
}

function realTileSize(canvas) {
	return (canvas.offsetWidth / canvas.width) * TILE_SIZE
}

function updateNextMoveText(next_player) {
	next_move_text = document.getElementById('next_move_text');
	next_move_text.textContent = "Next Move: " + (next_player == 0 ? "White" : "Black");
}

function updateErrorText(move_result) {
	next_move_text = document.getElementById('error_text');
	if (move_result === "suicidal") {
		next_move_text.textContent = "Can't play moves that would kill your own stones"
	} else {
		next_move_text.textContent = ""
	}
}

function reDrawBoard(stones) {
	var tile_image = null;
	var stone_images = []
	images_collection = document.images
	for(var i = 0; i < images_collection.length; i++) {
  	if(images_collection[i].id == "goban_tile_image") {
			tile_image = images_collection[i]
		}
  	if(images_collection[i].id == "goban_tile_with_white_image") {
			stone_images["white"] = images_collection[i]
		}
  	if(images_collection[i].id == "goban_tile_with_black_image") {
			stone_images["black"] = images_collection[i]
		}
	}

	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		size = canvas.width / TILE_SIZE
		var ctx = canvas.getContext('2d');
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        ctx.drawImage(tile_image, j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
		}

		for (var i in stones) {
			group = stones[i]

			for (var j in group) {
				stone = group[j]
				color = stone[1]
				x = stone[0][0]
				y = stone[0][1]

				if (color != null) {
					ctx.drawImage(stone_images[color], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				}
			}
		}

		// draw debug lines indicating groups
		for (var i in stones) {
			group = stones[i]

			ctx.beginPath();
			ctx.strokeStyle = 'red';
			ctx.lineWidth = 1;

			for (var j in group) {
				stone = group[j]
				color = stone[1]
				x = stone[0][0]
				y = stone[0][1]

				if (j == 0)
					ctx.moveTo((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE);
				else
					ctx.lineTo((x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE);
			}

			ctx.closePath();
			ctx.stroke();
		}

		// non-group related stone drawing code
		// for (var x = 0; x < stones.length; x++) {
		// 	for (var y = 0; y < stones[x].length; y++) {
		// 		color = stones[x][y]
		// 		if (color != null) {
		// 			ctx.drawImage(stone_images[color], x * tile_size, y * tile_size, tile_size, tile_size);
		// 		}
		// 	}
		// }
	}
}

function displayKilledStones(stones) {
	// help i just copypasted this and its very dumb
	var tile_image = null;
	var stone_images = []
	images_collection = document.images
	for(var i = 0; i < images_collection.length; i++) {
		if(images_collection[i].id == "goban_tile_image") {
			tile_image = images_collection[i]
		}
		if(images_collection[i].id == "goban_tile_with_white_image") {
			stone_images["white"] = images_collection[i]
		}
		if(images_collection[i].id == "goban_tile_with_black_image") {
			stone_images["black"] = images_collection[i]
		}
	}

	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		for (var stone of stones) {
			color = stone[1]
			x = stone[0][0]
			y = stone[0][1]

			if (color != null) {
				ctx.save()
				ctx.globalAlpha = 0.4
				ctx.drawImage(stone_images[color], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
				ctx.restore()
			}
		}
	}
}

// code for scrolling around history with arrow keys
var keyMap = {
	39: 'right',
	37: 'left',
	38: 'up',
	40: 'down'
}

function keydown() {
	console.log("keydown")
	var key = keyMap[event.keyCode]
	if (key == 'right' && HISTORY_LIST.length > currentlyDisplayedMove + 1) {
		displayStateFromMove(currentlyDisplayedMove + 1)
	} else if (key == 'left' && currentlyDisplayedMove > 0) {
		displayStateFromMove(currentlyDisplayedMove - 1)
	}
}

window.addEventListener("keydown", keydown, false)