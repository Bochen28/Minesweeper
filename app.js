window.onload = function () {
  const difficulties = document.querySelector(".difficulties");
  const gameBox = document.querySelector(".gameBox");
  const flags = document.querySelector("#flags");
  const easy = document.querySelector("#easy");
  const medium = document.querySelector("#medium");
  const hard = document.querySelector("#hard");
  const backdrop = document.querySelector(".backdrop");
  const victoryBox = document.querySelector(".victory");
  const replay = document.querySelector(".replay");
  const bigReplay = document.querySelector(".bigReplay");

  let flagCount = 0;
  let minesLeft = 0;
  let lose = false;

  // Array shuffler
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Generate game
  function generateGame(size, mines) {
    // Changing the view
    difficulties.style.display = "none";
    gameBox.style.display = "flex";
    gameBox.style.height = size * 2 + "rem";
    gameBox.style.width = size * 2 + "rem";
    bigReplay.style.display = "block";
    flagCount = mines;
    minesLeft = mines;
    flags.innerHTML = "Flags left: " + flagCount;

    // Shuffling mines
    const minesArr = Array(mines).fill("mine");
    const emptyArr = Array(size * size - mines).fill("valid");
    const gameArr = emptyArr.concat(minesArr);
    const shuffledArr = shuffleArray(gameArr);

    // Generating fields
    for (let index = 0; index < shuffledArr.length; index++) {
      const field = document.createElement("div");
      field.id = index;
      field.classList.add("field");
      field.addEventListener("contextmenu", flag);
      field.addEventListener("click", (event) => handleClick(event, index, size, shuffledArr));

      if (shuffledArr[index] === "mine") {
        field.classList.add("mine");
      }
      gameBox.appendChild(field);
    }
  }

  // Counting adjacent mines
  function countAdjacentMines(index, size, shuffledArr) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    let count = 0;
    const row = Math.floor(index / size);
    const col = index % size;

    for (const dir of directions) {
      const newRow = row + dir[0];
      const newCol = col + dir[1];
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const neighborIndex = newRow * size + newCol;
        if (shuffledArr[neighborIndex] === "mine") {
          count++;
        }
      }
    }
    return count;
  }

  // Revealing adjacent empty fields
  function revealEmptyFields(index, size, shuffledArr, visited) {
    const directions = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    const row = Math.floor(index / size);
    const col = index % size;

    for (const dir of directions) {
      const newRow = row + dir[0];
      const newCol = col + dir[1];
      const neighborIndex = newRow * size + newCol;

      if (
        newRow >= 0 &&
        newRow < size &&
        newCol >= 0 &&
        newCol < size &&
        !visited[neighborIndex]
      ) {
        visited[neighborIndex] = true;

        const field = document.getElementById(neighborIndex);
        if (shuffledArr[neighborIndex] !== "mine") {
          field.style.background = "#ffffff";
          const adjacentMines = countAdjacentMines(
            neighborIndex,
            size,
            shuffledArr
          );
          if (adjacentMines === 0) {
            revealEmptyFields(neighborIndex, size, shuffledArr, visited);
          } else {
            field.innerText = adjacentMines;
          }
        }
      }
    }
  }

  // Function to handle click on a field
  function handleClick(event, index, size, shuffledArr) {
    const field = event.target;

    // If the field is already revealed or flagged, do nothing
    if (field.innerText !== "" || field.innerHTML === "🚩") {
      return;
    }

    // If the field is a mine, handle explosion
    if (field.classList.contains("mine")) {
      explosion();
      return;
    }

    // If the field is empty, reveal adjacent empty fields
    if (shuffledArr[index] === "valid") {
      const visited = new Array(size * size).fill(false);
      revealEmptyFields(index, size, shuffledArr, visited);
    }
  }

  // Add flag
  function flag(event) {
    event.preventDefault();
    if (!lose) {
      const field = event.target;
      if (field.innerHTML === "🚩") {
        field.innerHTML = "";
        flagCount++;
        if (field.classList.contains("mine")) {
          minesLeft++;
        }
      } else {
        if (flagCount > 0) {
          field.innerHTML = "🚩";
          flagCount--;
          if (field.classList.contains("mine")) {
            minesLeft--;
            // Victory mechanic
            if (minesLeft === 0) {
              backdrop.style.display = "flex";
              victoryBox.style.display = "flex";
              bigReplay.style.display = "none";
            }
          }
        }
      }
    }
    flags.innerHTML = `Flags left: ${flagCount}`;
  }

  // Mine explosion
  function explosion() {
    const mines = document.querySelectorAll(".mine");
    lose = true;
    mines.forEach((mine) => {
      mine.style.backgroundColor = "red";
      mine.innerHTML = "💣";
    });
  }

  // Adding event listeners for difficulty selectors
  easy.addEventListener("click", () => generateGame(8, 10));
  medium.addEventListener("click", () => generateGame(16, 40));
  hard.addEventListener("click", () => generateGame(24, 80));

  // Replay button
  replay.addEventListener("click", () => window.location.reload());
  bigReplay.addEventListener("click", () => window.location.reload());
};
