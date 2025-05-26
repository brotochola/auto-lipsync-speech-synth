// Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 400,
  parent: "phaser-game",
  backgroundColor: "#34495e",
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};
let mouthSprite;
let scene;

function preload() {
  scene = this;

  // Load all mouth textures
  const visemes = [
    "a",
    "e",
    "f",
    "l",
    "m",
    "o",
    "r",
    "s",
    "sh",
    "th",
    "u",
    "rest",
  ];

  visemes.forEach((viseme) => {
    this.load.image(`mouth_${viseme}`, `./mouths/${viseme}.png`);
  });
}

function create() {
  mouthSprite = this.add.sprite(200, 200, "mouth_rest");
}
function updateMouth(viseme) {
  // Convert viseme to lowercase to match our texture names
  const visemeKey = viseme.toLowerCase();

  // Check if the texture exists before setting it

  mouthSprite.setTexture(`mouth_${visemeKey}`);
}

function update() {}
let arrOfTimeOuts = [];

function animateWordInMouth(word) {
  let currentVisemeIndex = 0;

  for (let i = 0; i < arrOfTimeOuts.length; i++) {
    clearTimeout(arrOfTimeOuts[i]);
  }
  arrOfTimeOuts = [];
  console.log(word);

  if (!word) {
    updateMouth("rest");
    return;
  }

  let totalDuration = word.durations[0];

  updateMouth(word.visemes[0]);
  for (let i = 1; i < word.visemes.length; i++) {
    const timeoutObj = setTimeout(() => {
      updateMouth(word.visemes[i]);
    }, totalDuration);

    arrOfTimeOuts.push(timeoutObj);
    totalDuration += word.durations[i] / currentUtterance.rate;
  }
  setTimeout(() => {
    updateMouth("rest");
  }, totalDuration);

  /*
    durations: Array [ 80, 120 ]
​
    phonemes: Array [ "DH", "AH" ]
    ​
    visemes: Array [ "TH", "A" ]
    ​
    word: "the"
    */
}

const game = new Phaser.Game(config);
