const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const sprites = new Image();
sprites.src = "./chessPieces.png";

const tileSize = Math.floor(canvas.width / 8);
const charSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+=";
let pieces, board, whiteTurn, selectedPiece, availableMoves, lastMove, whiteCheck, blackCheck, capturedPieces;
let game, frame;

const setup = () => {
	lastMove = { from: undefined, to: undefined };
	createBoard("100mimjmkmlmmmnmomplalhkbkgjcjfidhegWgXgYgZg0g1g2g3f4f+e5e-d6d9c7b8");
	game = ["100mimjmkmlmmmnmomplalhkbkgjcjfidhegWgXgYgZg0g1g2g3f4f+e5e-d6d9c7b8"];
	frame = 0;
	requestAnimationFrame(draw);
};

const draw = () => {
	drawBoard();
	requestAnimationFrame(draw);
};

const drawBoard = () => {
	context.fillStyle = "#5a944a";
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.fillStyle = "#e3dfcc";
	for (let x = 0; x < 8; x++) {
		for (let y = 0; y < 8; y++) {
			if (x % 2 === y % 2) {
				context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
			}
		}
	}
	if (lastMove.from) {
		context.fillStyle = "rgba(217, 200, 26, 0.5)";
		context.fillRect(lastMove.from.x * tileSize, lastMove.from.y * tileSize, tileSize, tileSize);
		context.fillRect(lastMove.to.x * tileSize, lastMove.to.y * tileSize, tileSize, tileSize);
	}
	pieces.forEach((p) => {
		p.draw();
	});
	context.fillStyle = "rgba(179, 36, 34, 0.65)";
	availableMoves.forEach((m) => {
		context.beginPath();
		context.arc((m.x + 0.5) * tileSize, (m.y + 0.5) * tileSize, 7, 0, 7);
		context.fill();
	});
	if (selectedPiece) {
		context.strokeStyle = "rgba(179, 36, 34, 0.8)";
		context.lineWidth = 3;
		context.strokeRect(selectedPiece.x * tileSize + 1, selectedPiece.y * tileSize + 1, tileSize - 2, tileSize - 2);
	}
};

const createBoard = (str) => {
	board = [];
	pieces = [];
	availableMoves = [];

	for (let y = 0; y < 8; y++) {
		let row = [];
		for (let x = 0; x < 8; x++) {
			row.push(0);
		}
		board.push(row);
	}

	whiteTurn = str.substring(0, 1) === "1";

	if (str.substring(1, 3) !== "00") {
		lastMove.from = { x: charSet.indexOf(str.substring(1, 2)) % 8, y: Math.floor(charSet.indexOf(str.substring(1, 2)) / 8) };
		lastMove.to = { x: charSet.indexOf(str.substring(2, 3)) % 8, y: Math.floor(charSet.indexOf(str.substring(2, 3)) / 8) };
	}

	let index = 3;
	while (index < str.length) {
		const piece = str.substring(index, index + 2);
		const type = piece.substring(0, 1);
		const white = charSet.indexOf(type) <= 6;
		const pos = piece.substring(1, 2);
		if (pos !== "=") {
			const x = charSet.indexOf(pos) % 8;
			const y = Math.floor(charSet.indexOf(pos) / 8);

			let piece;
			switch (type) {
				case "h":
				case "b":
					piece = new King(x, y, white);
					break;
				case "i":
				case "c":
					piece = new Queen(x, y, white);
					break;
				case "j":
				case "d":
					piece = new Bishop(x, y, white);
					break;
				case "k":
				case "e":
					piece = new Knight(x, y, white);
					break;
				case "l":
				case "f":
					piece = new Rook(x, y, white);
					break;
				case "m":
				case "g":
					piece = new Pawn(x, y, white);
					break;
			}

			board[y][x] = piece;
			pieces.push(piece);
		}

		index += 2;
	}

	whiteCheck = testForCheck(true);
	blackCheck = testForCheck(false);
	updateText();
};

const updateText = () => {
	if (whiteTurn) {
		$("#white-turn").show();
		$("#black-turn").hide();
	} else {
		$("#white-turn").hide();
		$("#black-turn").show();
	}
	if (whiteCheck) {
		$("#white-check").show();
	} else {
		$("#white-check").hide();
	}
	if (blackCheck) {
		$("#black-check").show();
	} else {
		$("#black-check").hide();
	}
};

const inBounds = (x, y) => {
	return x >= 0 && x < 8 && y >= 0 && y < 8;
};

const getMovesFromLine = (x, y, xDir, yDir, white, list) => {
	while (true) {
		if (inBounds(x + xDir, y + yDir)) {
			const piece = board[y + yDir][x + xDir];
			if (piece === 0) {
				list.push({ x: x + xDir, y: y + yDir });
			} else {
				if (piece.white !== white) {
					list.push({ x: x + xDir, y: y + yDir });
				}
				return;
			}
			x += xDir;
			y += yDir;
		} else {
			return;
		}
	}
};

class Piece {
	constructor(x, y, white) {
		this.x = x;
		this.y = y;
		this.white = white;
		this.moved = false;
	}

	draw(xIndex) {
		let yIndex = 133;
		if (this.white) {
			yIndex = 0;
		}

		context.drawImage(sprites, xIndex, yIndex, 133, 133, this.x * tileSize, this.y * tileSize, tileSize, tileSize);
	}

	move(pos) {
		if (board[pos.y][pos.x] !== 0) {
			pieces.splice(pieces.indexOf(board[pos.y][pos.x]), 1);
		}
		board[this.y][this.x] = 0;
		this.x = pos.x;
		this.y = pos.y;
		board[this.y][this.x] = this;
		this.moved = true;
	}
}

class King extends Piece {
	constructor(x, y, white) {
		super(x, y, white);
	}

	draw() {
		super.draw(0);
	}

	getMoves() {
		let moves = [];
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				if ((y !== 0 || x !== 0) && inBounds(this.x + x, this.y + y)) {
					const piece = board[this.y + y][this.x + x];
					if (piece === 0 || piece.white !== this.white) {
						moves.push({ x: this.x + x, y: this.y + y });
					}
				}
			}
		}

		if (!this.moved && ((this.white && !whiteCheck) || (!this.white && !blackCheck))) {
			if (board[this.y][7] instanceof Rook && !board[this.y][7].moved) {
				if (board[this.y][6] === 0 && board[this.y][5] === 0) {
					moves.push({ x: 6, y: this.y });
				}
			}
			if (board[this.y][0] instanceof Rook && !board[this.y][0].moved) {
				if (board[this.y][1] === 0 && board[this.y][2] === 0 && board[this.y][3] === 0) {
					moves.push({ x: 2, y: this.y });
				}
			}
		}

		return moves;
	}
}

class Queen extends Piece {
	constructor(x, y, white) {
		super(x, y, white);
	}

	draw() {
		super.draw(133);
	}

	getMoves() {
		let moves = [];
		getMovesFromLine(this.x, this.y, 1, 0, this.white, moves);
		getMovesFromLine(this.x, this.y, -1, 0, this.white, moves);
		getMovesFromLine(this.x, this.y, 0, 1, this.white, moves);
		getMovesFromLine(this.x, this.y, 0, -1, this.white, moves);
		getMovesFromLine(this.x, this.y, 1, 1, this.white, moves);
		getMovesFromLine(this.x, this.y, -1, 1, this.white, moves);
		getMovesFromLine(this.x, this.y, 1, -1, this.white, moves);
		getMovesFromLine(this.x, this.y, -1, -1, this.white, moves);
		return moves;
	}
}

class Bishop extends Piece {
	constructor(x, y, white) {
		super(x, y, white);
	}

	draw() {
		super.draw(266);
	}

	getMoves() {
		let moves = [];
		getMovesFromLine(this.x, this.y, 1, 1, this.white, moves);
		getMovesFromLine(this.x, this.y, -1, 1, this.white, moves);
		getMovesFromLine(this.x, this.y, 1, -1, this.white, moves);
		getMovesFromLine(this.x, this.y, -1, -1, this.white, moves);
		return moves;
	}
}

class Knight extends Piece {
	constructor(x, y, white) {
		super(x, y, white);
	}

	draw() {
		super.draw(399);
	}

	getMoves() {
		let moves = [];
		for (let xMult = -1; xMult <= 1; xMult += 2) {
			for (let yMult = -1; yMult <= 1; yMult += 2) {
				if (inBounds(this.x + 2 * xMult, this.y + yMult)) {
					const piece = board[this.y + yMult][this.x + 2 * xMult];
					if (piece === 0 || piece.white !== this.white) {
						moves.push({ x: this.x + 2 * xMult, y: this.y + yMult });
					}
				}
				if (inBounds(this.x + xMult, this.y + 2 * yMult)) {
					const piece = board[this.y + 2 * yMult][this.x + xMult];
					if (piece === 0 || piece.white !== this.white) {
						moves.push({ x: this.x + xMult, y: this.y + 2 * yMult });
					}
				}
			}
		}
		return moves;
	}
}

class Rook extends Piece {
	constructor(x, y, white) {
		super(x, y, white);
	}

	draw() {
		super.draw(532);
	}

	getMoves = () => {
		let moves = [];
		getMovesFromLine(this.x, this.y, 1, 0, this.white, moves);
		getMovesFromLine(this.x, this.y, -1, 0, this.white, moves);
		getMovesFromLine(this.x, this.y, 0, 1, this.white, moves);
		getMovesFromLine(this.x, this.y, 0, -1, this.white, moves);
		return moves;
	};
}

class Pawn extends Piece {
	constructor(x, y, white) {
		super(x, y, white);
		if (this.white) {
			this.yDir = -1;
		} else {
			this.yDir = 1;
		}
	}

	draw() {
		super.draw(665);
	}

	getMoves() {
		let moves = [];
		if (inBounds(this.x, this.y + this.yDir) && board[this.y + this.yDir][this.x] === 0) {
			moves.push({ x: this.x, y: this.y + this.yDir });
			if (!this.moved && inBounds(this.x, this.y + 2 * this.yDir) && board[this.y + 2 * this.yDir][this.x] === 0) {
				moves.push({ x: this.x, y: this.y + 2 * this.yDir });
			}
		}
		if (inBounds(this.x + 1, this.y + this.yDir)) {
			const piece = board[this.y + this.yDir][this.x + 1];
			if (piece !== 0 && piece.white !== this.white) {
				moves.push({ x: this.x + 1, y: this.y + this.yDir });
			}
		}
		if (inBounds(this.x - 1, this.y + this.yDir)) {
			const piece = board[this.y + this.yDir][this.x - 1];
			if (piece !== 0 && piece.white !== this.white) {
				moves.push({ x: this.x - 1, y: this.y + this.yDir });
			}
		}
		return moves;
	}
}

document.onmousedown = (e) => {
	e = window.event || e;
	e.preventDefault();
	const rect = canvas.getBoundingClientRect();
	const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

	if (pos.x > 0 && pos.y > 0 && pos.x < canvas.width && pos.y < canvas.height) {
		const x = Math.floor(pos.x / tileSize);
		const y = Math.floor(pos.y / tileSize);
		const piece = board[y][x];

		for (const m of availableMoves) {
			if (m.x === x && m.y === y) {
				if (selectedPiece instanceof King && Math.abs(selectedPiece.x - m.x) === 2) {
					if (m.x > selectedPiece.x) {
						board[selectedPiece.y][7].move({ x: 5, y: selectedPiece.y });
					} else {
						board[selectedPiece.y][0].move({ x: 3, y: selectedPiece.y });
					}
				}

				lastMove.to = { x: m.x, y: m.y };
				lastMove.from = { x: selectedPiece.x, y: selectedPiece.y };
				selectedPiece.move(m);
				whiteTurn = !whiteTurn;
				availableMoves = [];
				whiteCheck = testForCheck(true);
				blackCheck = testForCheck(false);
				updateText();

				if (whiteCheck) {
					let ableToMove = false;
					for (let i = 0; i < pieces.length; i++) {
						selectedPiece = pieces[i];
						if (selectedPiece.white === true && removeCheckMoves(selectedPiece.getMoves()).length > 0) {
							ableToMove = true;
							break;
						}
					}
					if (!ableToMove) {
						console.log("BLACK WINS");
					}
				}
				if (blackCheck) {
					let ableToMove = false;
					for (let i = 0; i < pieces.length; i++) {
						selectedPiece = pieces[i];
						if (selectedPiece.white === false && removeCheckMoves(selectedPiece.getMoves()).length > 0) {
							ableToMove = true;
							break;
						}
					}
					if (!ableToMove) {
						console.log("WHITE WINS");
					}
				}

				selectedPiece = undefined;
				return;
			}
		}
		if (piece !== 0 && piece.white === whiteTurn) {
			selectedPiece = piece;
			availableMoves = piece.getMoves();
			removeCheckMoves(availableMoves);
			return;
		}
		selectedPiece = undefined;
		availableMoves = [];
	}
};

const removeCheckMoves = (list) => {
	for (let i = 0; i < list.length; i++) {
		const m = list[i];
		const cPieces = clonePieces();
		const cBoard = cloneBoard(cPieces);
		const index = { x: selectedPiece.x, y: selectedPiece.y };

		selectedPiece.move(m);
		if (testForCheck(selectedPiece.white)) {
			list.splice(i, 1);
			i--;
		}

		board = cBoard;
		pieces = cPieces;
		selectedPiece = board[index.y][index.x];
	}
	return list;
};

const testForCheck = (white) => {
	for (const p of pieces) {
		if (p.white !== white) {
			const moves = p.getMoves();
			for (const m of moves) {
				for (const t of pieces) {
					if (t instanceof King && t.white === white && m.x === t.x && m.y === t.y) {
						return true;
					}
				}
			}
		}
	}
	return false;
};

const cloneBoard = (clonedPieces) => {
	let clonedBoard = [];
	for (let y = 0; y < 8; y++) {
		let row = [];
		for (let x = 0; x < 8; x++) {
			row.push(0);
		}
		clonedBoard.push(row);
	}
	clonedPieces.forEach((p) => {
		clonedBoard[p.y][p.x] = p;
	});
	return clonedBoard;
};

const clonePieces = () => {
	const clonedPieces = [];
	pieces.forEach((p) => {
		clonedPieces.push(clonePiece(p));
	});
	return clonedPieces;
};

const clonePiece = (p) => {
	let clonedPiece;
	if (p instanceof King) {
		clonedPiece = new King(p.x, p.y, p.white);
	} else if (p instanceof Queen) {
		clonedPiece = new Queen(p.x, p.y, p.white);
	} else if (p instanceof Bishop) {
		clonedPiece = new Bishop(p.x, p.y, p.white);
	} else if (p instanceof Knight) {
		clonedPiece = new Knight(p.x, p.y, p.white);
	} else if (p instanceof Rook) {
		clonedPiece = new Rook(p.x, p.y, p.white);
	} else if (p instanceof Pawn) {
		clonedPiece = new Pawn(p.x, p.y, p.white);
	}

	clonedPiece.moved = p.moved;
	return clonedPiece;
};

document.onload = setup();
