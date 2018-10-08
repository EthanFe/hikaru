//Subscribe and Trigger are now methods of api 
// const api = WarpCable("wss://19c1a3d3.ngrok.io/cable")
const api = WarpCable("ws:localhost:3000/cable")
const TILE_SIZE = 64

document.addEventListener("turbolinks:load", function() {
	game_id = parseInt(document.URL.split("/games/")[1])
	api.subscribe('Gamestates', 'game_state', {id: game_id}, data => {
		updateScreen(JSON.parse(data))
		console.log("Update screen!")
	})

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);
});

function updateScreen(data) {
	updateErrorText("")
	if (data["move_result"] === null || data["move_result"] === "success") { // no move was played, or move was successful
		reDrawBoard(data["board"])
		updateNextMoveText(data["next_player"])
		if (data["last_move"] != null)
			highlightLastMovePlayed(data["last_move"], data["next_player"])
		displayHistoryList(data["history"])
	} else if (data["move_result"] === "suicidal") {
		updateErrorText("Can't play moves that would kill your own stones")
	} else if (data["move_result"] === "occupied") {

	}
}

function displayHistoryList(history) {
	historyList = document.getElementById('history_list')
	historyList.innerHTML = ""
	for (const move of history) {
		historyList.innerHTML += `<li>${move.color} played at ${move.x}, ${move.y}</li>`
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

function clickOnBoard(canvas, event) {
	clickedSquareIndices = getCursorPosition(canvas, event)
	console.log(clickedSquareIndices);

	game_id = parseInt(document.URL.split("/games/")[1])
	api.trigger('Gamestates', 'play', {id: game_id, x: clickedSquareIndices[0], y: clickedSquareIndices[1]}, data => {
		console.log("Played move and got response")
		updateScreen(JSON.parse(data))
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

function updateErrorText(error_message) {
	next_move_text = document.getElementById('error_text');
	next_move_text.textContent = error_message
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