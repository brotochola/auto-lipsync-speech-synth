const phonemeDurations = {
  vowels: 90,
  consonants: 45,
  silence: 40,
};

function addFunctionality() {
  document
    .getElementById("testSpeechBtn")
    .addEventListener("click", testSpeechWithAnimation);
  document
    .getElementById("stopSpeechBtn")
    .addEventListener("click", stopSpeech);
}

// Basic English phoneme to viseme mapping

const availableVisemes = [
  "A",
  "O",
  "E",
  "I",
  "U",
  "M",
  "F",
  "TH",
  "L",
  "S",
  "SH",
  "REST",
  "R",
  "W",
];

// Helper function to categorize phonemes for duration calculation

let currentUtterance = null;
let animationData = null;
let currentVisemeIndex = 0;
let currentWord = null;
let wordToVisemeMap = [];
let isAnimating = false;

function updateSpeechRateDisplay() {
  document.getElementById("speechRateValue").textContent =
    document.getElementById("speechRate").value;
}

function createWordToVisemeMapping(text) {
  const selectedLanguage = document
    .getElementById("languageSelect")
    .value.toLowerCase()
    .substring(0, 2);

  //   text = convertNumbersToWords(text, selectedLanguage);

  let words = text.toLowerCase().split(/\s+/);
  const mapping = {};
  let charIndex = 0;

  for (let word of words) {
    let wordWithoutPunctuation = word.replace(/[^\w\s]/g, "").toLowerCase();

    let phonemes;
    if (selectedLanguage === "es") {
      // Use Spanish phoneme conversion
      phonemes = convertSpanishWordToPhonemes(wordWithoutPunctuation);
    } else {
      // Use English phoneme conversion
      phonemes = convertWordToPhonemesInEnglish(wordWithoutPunctuation);
    }

    mapping[charIndex] = {
      word: word,
      phonemes: phonemes,
      visemes: [],
      durations: [],
    };

    const newDurations = getSequenceDurations(phonemes);
    const durationModifier = selectedLanguage === "es" ? 0.66 : 1;

    mapping[charIndex].phonemes.forEach((phoneme, i) => {
      const viseme = convertPhonemesToVisemes(phoneme) || "REST";
      mapping[charIndex].visemes.push(viseme);
      mapping[charIndex].durations.push(
        newDurations[i].duration * durationModifier
      );
    });

    charIndex += word.length + 1; // +1 for space
  }

  return mapping;
}
window.createWordToVisemeMapping = createWordToVisemeMapping;

function removeConsecutiveDuplicates(arr) {
  if (!arr || arr.length === 0) {
    return [];
  }
  const result = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1]) {
      result.push(arr[i]);
    }
  }
  return result;
}

function testSpeechWithAnimation() {
  const selectedLanguage = document.getElementById("languageSelect").value;

  const text = convertNumbersToWords(
    document.getElementById("textInput").value,
    selectedLanguage.toLowerCase().substring(0, 2)
  );

  const speechRate = parseFloat(document.getElementById("speechRate").value);

  if (!text.trim()) {
    alert("Please enter some text to speak.");
    return;
  }

  wordToVisemeMap = createWordToVisemeMapping(text);

  console.log(selectedLanguage, text, wordToVisemeMap);

  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.rate = speechRate;
  currentUtterance.lang = selectedLanguage;

  window.currentUtterance = currentUtterance;

  currentVisemeIndex = 0;
  isAnimating = true;

  currentUtterance.onstart = () => {
    document.getElementById("testSpeechBtn").disabled = true;
    document.getElementById("stopSpeechBtn").disabled = false;
    console.log("Speech and animation started");
  };

  currentUtterance.onboundary = (event) => {
    if (event.name === "word") {
      animateWordInMouth(wordToVisemeMap[event.charIndex]);
    } else {
      animateWordInMouth(null);
    }
  };

  currentUtterance.onend = () => {
    document.getElementById("testSpeechBtn").disabled = false;
    document.getElementById("stopSpeechBtn").disabled = true;
    isAnimating = false;

    console.log("Speech and animation ended");
  };

  console.log("Current utterance:", currentUtterance);

  speechSynthesis.speak(currentUtterance);
}

function stopSpeech() {
  if (currentUtterance) {
    speechSynthesis.cancel();
    document.getElementById("testSpeechBtn").disabled = false;
    document.getElementById("stopSpeechBtn").disabled = true;
  }
}

// Initialize
function init() {
  TextToIPA.loadDict("ipadict.txt", () => {
    console.log("loaded");

    // Initialize functionality after data is loaded
    addFunctionality();

    // // Generate initial example
    // generateLipsync();
  });
  document
    .getElementById("speechRate")
    .addEventListener("input", updateSpeechRateDisplay);

  updateSpeechRateDisplay();
}
init();
