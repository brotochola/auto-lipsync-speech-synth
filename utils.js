// Initialize converter
let phonemeConverter = new PhonemeConverter();

function convertWordToPhonemes(word) {
  const arrRet = [];
  const phonemesResult = TextToIPA.lookup(word);

  console.log("phonemesResult", phonemesResult);

  if (!phonemesResult.error || phonemesResult.error == "multi") {
    for (let i = 0; i < phonemesResult.text.length; i++) {
      const phoneme = phonemesResult.text[i];
      const arpabet = ipaToArpabet(phoneme);
      arrRet.push(arpabet);
    }
    return arrRet;
  }
  return convertWordToPhonemesWithNoDictionary(word);
}

function convertWordToPhonemesWithNoDictionary(word) {
  return phonemeConverter.wordToPhonemes(word);
}

function ipaToArpabet(ipa) {
  const ipaToArpabetMap = {
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
    ə: "ER", // or AH depending on context
    ɜ: "ER",
    ɝ: "ER",
    aɪ: "AY",
    aʊ: "AW",
    ɔɪ: "OY",
    oʊ: "OW",
    eɪ: "EY",
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
  };

  let arpabet = "";
  let i = 0;

  while (i < ipa.length) {
    let found = false;
    for (const key in ipaToArpabetMap) {
      if (ipa.startsWith(key, i)) {
        arpabet += ipaToArpabetMap[key];
        i += key.length;
        found = true;
        break;
      }
    }
    if (!found) {
      i++;
    }
  }
  return arpabet;
}

function getPhonemeCategory(phoneme) {
  const vowels = [
    "AH",
    "EH",
    "IH",
    "OH",
    "UH",
    "AA",
    "AE",
    "AO",
    "AW",
    "AY",
    "EY",
    "IY",
    "OW",
    "OY",
    "UW",
  ];
  const consonants = [
    "B",
    "CH",
    "D",
    "DH",
    "F",
    "G",
    "HH",
    "JH",
    "K",
    "L",
    "M",
    "N",
    "NG",
    "P",
    "R",
    "S",
    "SH",
    "T",
    "TH",
    "V",
    "W",
    "Y",
    "Z",
    "ZH",
  ];

  if (
    !phoneme ||
    phoneme.toLowerCase() === "silence" ||
    phoneme.toLowerCase() === "rest"
  ) {
    return "silence";
  }

  if (vowels.includes(phoneme.toUpperCase())) {
    return "vowels";
  }

  if (consonants.includes(phoneme.toUpperCase())) {
    return "consonants";
  }

  // Default fallback based on common patterns
  if (
    phoneme.includes("AH") ||
    phoneme.includes("EH") ||
    phoneme.includes("IH") ||
    phoneme.includes("OH") ||
    phoneme.includes("UH")
  ) {
    return "vowels";
  }

  return "consonants";
}

function getPhonemeDuration(phoneme) {
  const phonemeDurations = {
    vowels: 133,
    consonants: 66,
    silence: 43,
  };

  const category = getPhonemeCategory(phoneme);
  return phonemeDurations[category];
}

function convertPhonemesToVisemes(phoneme) {
  const phonemeToVisemeMap = {
    IY: "E",
    IH: "E",
    EY: "E",
    EH: "E",
    AE: "A",
    AA: "A",
    AO: "O",
    UH: "U",
    UW: "U",
    AH: "A",
    ER: "R",
    AY: "A",
    OH: "O",
    AW: "O",
    OY: "O",
    OW: "O",
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

  return phonemeToVisemeMap[phoneme.toUpperCase()];
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
