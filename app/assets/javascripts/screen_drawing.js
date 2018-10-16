const DEBUG_GROUP_LINES = true

let tile_images
document.addEventListener("turbolinks:load", function() {
	tile_images = getTileImages()
})

function getTileImages() {
	images = {}
	let tile_image = null;
	let stone_images = []
	const images_collection = document.images
	for(var i = 0; i < images_collection.length; i++) {
		if(images_collection[i].id == "goban_tile_image") {
			images["blank"] = images_collection[i]
		}
		if(images_collection[i].id == "goban_tile_with_white_image") {
			images["white"] = images_collection[i]
		}
		if(images_collection[i].id == "goban_tile_with_black_image") {
			images["black"] = images_collection[i]
		}
	}
	return images
}

function updateScreen(data, move_id = null, groups = null, score = null, players_finished_scoring = null) {
  // just find the latest move if no historic move was specified
  if (move_id == null)
    move_id = data.length - 1

  // find the latest renderable state (non-pass), counting backwards from the specified move id
  latest_state = getLatestState(data, move_id)

	// the actual latest move, including passes
	// if no moves have been played yet dont do dis
	let latest_move

	// if no moves have been played, display a default state
	if (latest_state === undefined) {
		latest_state = {
			"board": [],
			"next_player": 1,
			"last_move": null,
			"killed_stones": []
		}
  } else {
		latest_move = data[move_id]
		currentlyDisplayedMove = HISTORY_LIST.indexOf(latest_move)
		console.log(currentlyDisplayedMove)
	}
	
	updateErrorText("")
	
	// game hasn't ended, endgame groups don't exist
	if (groups == null) {
		// using latest_move instead of latest_state here because the only state that changes from a pass is the active player
		// unless there's no latest move because no moves have been played yet. good code.
		if (data.length > 0)
			updateNextMoveText(latest_move["next_player"])
		else
			updateNextMoveText(latest_state["next_player"])

		reDrawBoard(latest_state["board"])
		displayKilledStones(latest_state["killed_stones"])
	} else { // game has ended
		reDrawBoard(groups)
		if (score === null) {
			// this code is horrible. why is this not a function. why is updatenextmovetext not more flexible. oh well.
			next_move_text = document.getElementById('next_move_text');
			next_move_text.textContent = "Now Scoring -- Click on groups to toggle living status"

			document.getElementById("player1_finished_scoring").textContent = `Player 1${players_finished_scoring[0] ? "" : " not"} finished`
			document.getElementById("player2_finished_scoring").textContent = `Player 2${players_finished_scoring[1] ? "" : " not"} finished`
		} else {
			// scoring has ended

			// this is not terrible code at all
			finalScoreText = document.getElementById('final_score')
			finalScoreText.textContent = `Final Score: ${score.black} vs ${score.white}`
		}
	}

	if (latest_state["last_move"] != null)
		highlightLastMovePlayed(latest_state["last_move"], latest_state["next_player"])

	displayHistoryList()
}

// search back through moves until one is found that has coordinates (isn't a pass)
function getLatestState(game_states, move_id) {
  let latest_state = undefined
  let offset = game_states.length - 1 - move_id
  while (latest_state === undefined && offset < game_states.length) {
    offset++
    const state = game_states[game_states.length - offset]
    if (moveIsNotPass(state.last_move)) {
      latest_state = state
      break
    }
  }
  return latest_state
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
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		size = canvas.width / TILE_SIZE
		var ctx = canvas.getContext('2d');
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        ctx.drawImage(tile_images["blank"], j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
		}

		for (let group of stones) {
			// if endgame groups (with alive status)
			if (group.stones != undefined) {
				for (let stone of group.stones) {
					color = stone[1]
					x = stone[0][0]
					y = stone[0][1]

					if (color != null) {
						if (group.alive) {
							ctx.drawImage(tile_images[color], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
						} else {
							drawImageTransparent(ctx, tile_images[color], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0.3)
						}
					}
				}
			} else // if normal groups (during game)
			{
				for (let stone of group) {
					color = stone[1]
					x = stone[0][0]
					y = stone[0][1]

					if (color != null) {
						ctx.drawImage(tile_images[color], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
					}
				}
			}
		}

    // draw debug lines indicating groups
    if (DEBUG_GROUP_LINES)
			drawGroupConnectionLines(stones, ctx)
	}
}

function drawImageTransparent(context, image, x, y, width, height, opacity) {
	context.save()
	context.globalAlpha = opacity
	context.drawImage(image, x, y, width, height);
	context.restore()
}

function drawGroupConnectionLines(stones, ctx) {
	for (let group of stones) {
		ctx.beginPath();
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 1;

		// ignore aliveness value even if groups are endgame groups
		if (group.stones != undefined)
			group = group.stones

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

function displayKilledStones(stones) {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
		for (var stone of stones) {
			color = stone[1]
			x = stone[0][0]
			y = stone[0][1]

			if (color != null) {
				drawImageTransparent(ctx, tile_images[color], x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, 0.4)
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
      var movePlayedText = moveIsNotPass(move) ? `${move.color} played at ${move.x}, ${move.y}` : `${move.color} passed`
      let killedStonesText = gameState.killed_stones.length > 0 ? `, capturing ${gameState.killed_stones.length} stones` : ""
      historyListElement.innerHTML += `<li ${currentlyDisplayedMove == index ? "class=active_move" : ""}><img width=32 height=32 src=${imgSource} onclick="displayStateFromMove(${index})"/>${movePlayedText}${killedStonesText}</li>`
		}

		// just here because we counted up the stones here and WHATEVER
		displayStonesCapturedText(stonesCaptured)
	}
}

function displayStonesCapturedText(stonesCaptured) {
	stones_captured_text = document.getElementById('stones_captured_text');
	stones_captured_text.textContent = "Stones captured: " + stonesCaptured.white + " vs " + stonesCaptured.black
}

function displayStateFromMove(move_id) {
	console.log("Displaying historic state for move id " + move_id)
	updateScreen(HISTORY_LIST, move_id)
}

function moveIsNotPass(move) {
  return move.x != null && move.y != null
}