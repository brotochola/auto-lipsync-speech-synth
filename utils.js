// Initialize converter
let phonemeConverter = new PhonemeConverter();

function convertWordToPhonemesInEnglish(word) {
  const arrRet = [];
  const phonemesResult = TextToIPA.lookup(word);

  if (!phonemesResult.error || phonemesResult.error == "multi") {
    // ipaToArpabet now returns an array of phonemes with stress markers
    const arpabetPhonemes = ipaToArpabet(phonemesResult.text);
    return arpabetPhonemes;
  }
  return convertWordToPhonemesWithNoDictionary(word);
}

function convertWordToPhonemesWithNoDictionary(word) {
  return phonemeConverter.wordToPhonemes(word);
}

function ipaToArpabet(ipa) {
  //tajˈmz
  const ipaToArpabetMap = {
    // Vowels (monophthongs)
    i: "IY",
    ɪ: "IH",
    e: "EY",
    ɛ: "EH",
    æ: "AE",
    ɑ: "AA",
    ɔ: "AO",
    ʊ: "UH",
    u: "UW",
    ʌ: "AH",
    ə: "AH", // schwa -> AH
    ɜ: "ER",
    ɝ: "ER",

    // Diphthongs - handle these first as they're longer sequences
    aɪ: "AY",
    aʊ: "AW",
    ɔɪ: "OY",
    oʊ: "OW", // This handles the "ow" sound properly
    eɪ: "EY",

    // CMU IPA dictionary variations (uses 'j' instead of 'ɪ' in diphthongs)
    aj: "AY", // CMU IPA notation for /aɪ/ (as in "times", "my", "eye")
    aw: "AW", // CMU IPA notation for /aʊ/ (as in "how", "now")
    oj: "OY", // CMU IPA notation for /ɔɪ/ (as in "boy", "toy")
    ej: "EY", // CMU IPA notation for /eɪ/ (as in "day", "say")

    // Handle common IPA sequences that should map to single ARPABET phonemes
    ow: "OW", // Direct mapping for "ow" sequence
    ou: "AW", // Alternative "ou" sound

    // Consonants
    p: "P",
    b: "B",
    t: "T",
    d: "D",
    k: "K",
    g: "G",
    f: "F",
    v: "V",
    θ: "TH",
    ð: "DH",
    s: "S",
    z: "Z",
    ʃ: "SH",
    ʒ: "ZH",
    h: "HH",
    m: "M",
    n: "N",
    ŋ: "NG",
    l: "L",
    r: "R",
    j: "Y",
    w: "W",
    tʃ: "CH",
    dʒ: "JH",

    // Handle single vowel 'o' that might appear
    o: "OW", // Map single 'o' to OW
  };

  let result = [];
  let i = 0;
  let currentStress = "";

  while (i < ipa.length) {
    let found = false;

    // Check for stress markers first
    if (ipa[i] === "1") {
      currentStress = "1"; // Primary stress
      i++;
      continue;
    } else if (ipa[i] === "2") {
      currentStress = "2"; // Secondary stress
      i++;
      continue;
    }

    // Try to match longer sequences first (diphthongs, then consonant clusters)
    const sortedKeys = Object.keys(ipaToArpabetMap).sort(
      (a, b) => b.length - a.length
    );

    for (const key of sortedKeys) {
      if (ipa.startsWith(key, i)) {
        let arpabetPhoneme = ipaToArpabetMap[key];

        // Add stress marker to vowels and diphthongs
        const vowelPhonemes = [
          "IY",
          "IH",
          "EY",
          "EH",
          "AE",
          "AA",
          "AO",
          "UH",
          "UW",
          "AH",
          "ER",
          "AY",
          "AW",
          "OY",
          "OW",
        ];
        if (vowelPhonemes.includes(arpabetPhoneme) && currentStress) {
          arpabetPhoneme += currentStress;
          currentStress = ""; // Reset stress after applying
        }

        result.push(arpabetPhoneme);
        i += key.length;
        found = true;
        break;
      }
    }

    // If no pattern matched, skip the character
    if (!found) {
      i++;
    }
  }

  return result;
}

// function getPhonemeCategory(phoneme) {
//   const vowels = [
//     "AH",
//     "EH",
//     "IH",
//     "OH",
//     "UH",
//     "AA",
//     "AE",
//     "AO",
//     "AW",
//     "AY",
//     "EY",
//     "IY",
//     "OW",
//     "OY",
//     "UW",
//   ];
//   const consonants = [
//     "B",
//     "CH",
//     "D",
//     "DH",
//     "F",
//     "G",
//     "HH",
//     "JH",
//     "K",
//     "L",
//     "M",
//     "N",
//     "NG",
//     "P",
//     "R",
//     "S",
//     "SH",
//     "T",
//     "TH",
//     "V",
//     "W",
//     "Y",
//     "Z",
//     "ZH",
//   ];

//   if (
//     !phoneme ||
//     phoneme.toLowerCase() === "silence" ||
//     phoneme.toLowerCase() === "rest"
//   ) {
//     return "silence";
//   }

//   if (vowels.includes(phoneme.toUpperCase())) {
//     return "vowels";
//   }

//   if (consonants.includes(phoneme.toUpperCase())) {
//     return "consonants";
//   }

//   // Default fallback based on common patterns
//   if (
//     phoneme.includes("AH") ||
//     phoneme.includes("EH") ||
//     phoneme.includes("IH") ||
//     phoneme.includes("OH") ||
//     phoneme.includes("UH")
//   ) {
//     return "vowels";
//   }

//   return "consonants";
// }

// function getPhonemeDuration(phoneme, lang = "en-us") {
//   console.log("#####", phoneme, lang);
//   lang = lang.toLowerCase().substring(0, 2);

//   const phonemeDurations = {
//     en: {
//       vowels: 133,
//       consonants: 66,
//       silence: 43,
//     },
//     es: {
//       vowels: 100,
//       consonants: 50,
//       silence: 33,
//     },
//   };

//   const category = getPhonemeCategory(phoneme);
//   return phonemeDurations[lang][category];
// }

function convertPhonemesToVisemes(phoneme) {
  const phonemeToVisemeMap = {
    // Monophthong vowels
    IY: "E",
    IH: "E",
    EH: "E",
    AE: "A",
    AA: "A",
    AO: "O",
    UH: "U",
    UW: "U",
    AH: "A",
    ER: "R",
    OH: "O",

    // Diphthongs - return arrays to show transition
    AY: ["A", "E"], // /aɪ/ - "my", "time" - transitions from open to close front
    AW: ["A", "U"], // /aʊ/ - "how", "now" - transitions from open to close back
    OY: ["O", "E"], // /ɔɪ/ - "boy", "toy" - transitions from mid-back to close front
    OW: ["O", "U"], // /oʊ/ - "go", "show" - transitions from mid-back to close back
    EY: ["E", "E"], // /eɪ/ - "day", "say" - slight transition, mostly stays in E position

    // Consonants
    Q: "U",
    P: "M",
    B: "M",
    T: "TH",
    D: "TH",
    K: "R",
    G: "E",
    F: "F",
    V: "F",
    TH: "TH",
    DH: "TH",
    S: "S",
    Z: "S",
    SH: "SH",
    ZH: "SH",
    H: "SH",
    HH: "R",
    M: "M",
    N: "L",
    NG: "REST",
    L: "L",
    R: "R",
    Y: "E",
    W: "U",
    CH: "SH",
    JH: "SH",
    "": "REST",
  };

  // Remove stress markers (0, 1, 2) from the phoneme before lookup
  const cleanPhoneme = phoneme.replace(/[012]$/, "");

  const result = phonemeToVisemeMap[cleanPhoneme.toUpperCase()];

  // Return the result (could be a string for monophthongs or array for diphthongs)
  return result;
}

function convertWordToPhonemesWithNoDictionary(word) {
  const wordWithoutPunctuation = word.replace(/[^\w\s]/g, "").toLowerCase();
  const letters = wordWithoutPunctuation.split("");
  const phonemes = [];

  for (let i = 0; i < letters.length; i++) {
    let letter = letters[i];
    switch (letter.toLowerCase()) {
      case "a":
        phonemes.push("AH");
        break;
      case "b":
        phonemes.push("B");
        break;
      case "c":
        if (letters[i + 1] === "h") {
          phonemes.push("SH");
          i++;
          break;
        } else {
          phonemes.push("K");
          break;
        }
      case "d":
        phonemes.push("D");
        break;
      case "e":
        phonemes.push("EH");
        break;
      case "f":
      case "v":
        phonemes.push("F");
        break;
      case "g":
        phonemes.push("G");
        break;
      case "h":
        phonemes.push("REST");
        break;
      case "i":
        phonemes.push("IH");
        break;
      case "j":
        phonemes.push("REST");
        break;
      case "k":
        phonemes.push("K");
        break;
      case "l":
        phonemes.push("L");
        break;
      case "m":
        phonemes.push("M");
        break;
      case "n":
        phonemes.push("N");
        break;
      case "o":
        phonemes.push("OH");
        break;
      case "p":
        phonemes.push("P");
        break;
      case "q":
        phonemes.push("K");
        break;
      case "r":
        phonemes.push("R");
        break;
      case "s":
        if (letters[i + 1] === "h") {
          phonemes.push("SH");
          i++;
          break;
        } else {
          phonemes.push("S");
          break;
        }
      case "t":
        phonemes.push("T");
        break;
      case "u":
        phonemes.push("UH");
        break;
      case "w":
        phonemes.push("UH");
        break;
      case "x":
        phonemes.push("S");
        break;
      case "y":
        phonemes.push("EH");
        break;
      case "z":
        phonemes.push("S");
        break;

      default:
        phonemes.push("REST");
        break;
    }

    const lastPhonemeAdded = phonemes[phonemes.length - 1];
    if (
      phonemes.length > 1 &&
      lastPhonemeAdded == phonemes[phonemes.length - 2]
    ) {
      phonemes.pop();
    }
  }

  return phonemes;
}

function convertNumbersToWords(text, lang = "en-us") {
  lang = lang.toLowerCase().substring(0, 2);
  let words = text.trim().split(/\s+/);
  const wordsRet = [];

  const functionToConvertNumbersToWords =
    lang === "es" ? convertirDeNumeroALetras : convertNumbersToEnglishWords;

  words = words.map((word) => {
    // Store original punctuation and case
    const punctuation = word.match(/[^\w\s]/g) || [];
    const originalCase = word.match(/[A-Z]/g) || [];
    let wordWithoutPunctuation = word.replace(/[^\w\s]/g, "");

    if (!isNaN(wordWithoutPunctuation)) {
      // Convert number to words
      wordWithoutPunctuation = functionToConvertNumbersToWords(
        wordWithoutPunctuation.toLowerCase()
      ).split(" ");
      // Add back punctuation to the last word
      if (punctuation.length > 0) {
        wordWithoutPunctuation[wordWithoutPunctuation.length - 1] +=
          punctuation.join("");
      }
      // Restore original case if there were uppercase letters
      if (originalCase.length > 0) {
        wordWithoutPunctuation = wordWithoutPunctuation.map(
          (w) => w.charAt(0).toUpperCase() + w.slice(1)
        );
      }
      wordsRet.push(wordWithoutPunctuation);
    } else {
      wordsRet.push(word);
    }
  });
  return wordsRet.flat().join(" ");
}
