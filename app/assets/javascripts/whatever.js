document.addEventListener("turbolinks:load", function() {
	// getData(document.URL + "/board_state", {})
  // .then(data => updateScreen(data)) // JSON-string from `response.json()` call
	// .catch(error => console.error(error));
	
	subscribe('Gamestates', 'play', {id: 15}, games => {
		updateScreen(JSON.parse(games))
		console.log("Update screen!")
	})

	// subscribe('Tests', 'example', {}, tests => {
  //   console.log(tests)
	// })

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);
});

function updateScreen(data) {
	reDrawBoard(data["board"])
	updateNextMoveText(data["next_player"])
	highlightLastMovePlayed(data["last_move"], data["next_player"])
}

function highlightLastMovePlayed(last_move, next_player) {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		ctx.strokeStyle = next_player == 0 ? "white" : "black";
		ctx.lineWidth = 5;
		ctx.beginPath();
		ctx.arc(last_move["x"] * 64 + 32, last_move["y"] * 64 + 32, 16, 0, Math.PI * 2, true); // Outer circle
		ctx.moveTo(110, 75);
		ctx.stroke();
	}
}

function clickOnBoard(canvas, event) {
	clickedSquareIndices = getCursorPosition(canvas, event)
	console.log(clickedSquareIndices);



	// subscribe('Tests', 'example', {}, tests => {
	// 	console.log('Received?')
	// })
	trigger('Gamestates', 'play', {id: 15, x: clickedSquareIndices[0], y: clickedSquareIndices[1]}, tests => {
		console.log('Received?')
	})
	// postData(document.URL + "/play", {x: clickedSquareIndices[0], y: clickedSquareIndices[1]})
  // .then(data => playMove(data)) // JSON-string from `response.json()` call
  // .catch(error => console.error(error));
}

function playMove(data) {
	updateErrorText("")
	if (data["move_result"] === "success") {
		updateScreen(data)
	} else if (data["move_result"] === "suicidal") {
		updateErrorText("Can't play moves that would kill your own stones")
	} else if (data["move_result"] === "occupied") {

	}
}

function getCursorPosition(canvas, event) {
	var x = event.pageX - canvas.offsetLeft,
			y = event.pageY - canvas.offsetTop;
	return [Math.floor(x / 64), Math.floor(y / 64)];
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
	var tile_size = 64;

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
		size = canvas.width / tile_size
		var ctx = canvas.getContext('2d');
    for (var i = 0; i < size; i++) {
      for (var j = 0; j < size; j++) {
        ctx.drawImage(tile_image, j * tile_size, i * tile_size, tile_size, tile_size);
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
					ctx.drawImage(stone_images[color], x * tile_size, y * tile_size, tile_size, tile_size);
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
					ctx.moveTo((x + 0.5) * tile_size, (y + 0.5) * tile_size);
				else
					ctx.lineTo((x + 0.5) * tile_size, (y + 0.5) * tile_size);
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