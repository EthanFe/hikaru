const DEBUG_GROUP_LINES = false

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
    if (DEBUG_GROUP_LINES) {
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

function displayHistoryList() {
	if (HISTORY_LIST.length > 0) {
		stonesCaptured = {"white": 0, "black": 0}
		historyListElement = document.getElementById('history_list')
		historyListElement.innerHTML = ""
		for (const [index, gameState] of HISTORY_LIST.entries()) {
			stonesCaptured[gameState.last_move.color] += gameState.killed_stones.length
			const imgSource = "/assets/tile_with_white-404735ee1942c50f532ae101578a0a0d37e5851e8533fa92218e94282817ad77.png"
			let move = gameState.last_move
			let killedStonesText = gameState.killed_stones.length > 0 ? `, capturing ${gameState.killed_stones.length} stones` : ""
			historyListElement.innerHTML += `<li ${currentlyDisplayedMove == index ? "class=active_move" : ""}><img width=32 height=32 src=${imgSource} onclick="displayStateFromMove(${index})"/>${move.color} played at ${move.x}, ${move.y}${killedStonesText}</li>`
		}
	}

	// why is this code here? i dont know look UI design is hard
	next_move_text = document.getElementById('next_move_text');
	next_move_text.innerHTML = "Stones captured: " + stonesCaptured.white + " vs " + stonesCaptured.black + "<br>" + next_move_text.textContent
}