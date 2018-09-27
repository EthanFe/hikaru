document.addEventListener("DOMContentLoaded", function() {
	// draw();
	var size = 9;
	var tile_size = 64;

	var image = null;
	images_collection = document.images
	for(var i = 0; i < images_collection.length; i++) {
  	if(images_collection[i].id == "goban_tile_image") {
			image = images_collection[i]
		}
	}

	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		var ctx = canvas.getContext('2d');
		// ctx.drawImage(image, 0, 0, tile_size, tile_size);
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
        ctx.drawImage(image, j * tile_size, i * tile_size, tile_size, tile_size);
      }
    }
	}

	canvas.addEventListener('click', () => clickOnBoard(canvas, event), false);

});

function clickOnBoard(canvas, event) {
	clickedSquareIndices = getCursorPosition(canvas, event)
	console.log(clickedSquareIndices);

	postData(document.URL + "/play", {x: clickedSquareIndices[0], y: clickedSquareIndices[1]})
  .then(data => playMove(data)) // JSON-string from `response.json()` call
  .catch(error => console.error(error));
}

function playMove(data) {
	console.log("Successful move: " + data["successful_move"])
	if (data["successful_move"] === "true") {
		reDrawBoard(data["board"])
	}
}

function getCursorPosition(canvas, event) {
	var x = event.pageX - canvas.offsetLeft,
			y = event.pageY - canvas.offsetTop;
	return [Math.floor(x / 64), Math.floor(y / 64)];
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
		var ctx = canvas.getContext('2d');
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < 9; j++) {
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

// function draw() {
// 	var canvas = document.getElementById('canvas');
// 	if (canvas.getContext) {
// 		var ctx = canvas.getContext('2d');

// 		ctx.fillStyle = 'rgb(200, 0, 0)';
// 		ctx.fillRect(10, 10, 50, 50);

// 		ctx.fillStyle = 'rgba(0, 0, 200, 0.5)';
// 		ctx.fillRect(30, 30, 50, 50);
// 	}
// }