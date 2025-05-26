/**
 * Advanced phoneme duration calculator based on phonetic research
 * Durations in milliseconds, based on studies by Klatt (1976), Crystal & House (1988),
 * and Spanish phonetic research by Machuca & Rios (2014)
 *
 * Accepts ARPAbet phoneme notation and converts to IPA for processing
 */

// ARPAbet to IPA conversion tables
const ARPABET_TO_IPA = {
  en: {
    // Vowels
    AA: "ɑ", // odd
    AE: "æ", // at
    AH: "ʌ", // hut
    AO: "ɔ", // ought
    AW: "aʊ", // cow
    AY: "aɪ", // hide
    EH: "ɛ", // Ed
    ER: "ɝ", // hurt
    EY: "eɪ", // ate
    IH: "ɪ", // it
    IY: "i", // eat
    OW: "oʊ", // oat
    OY: "ɔɪ", // toy
    UH: "ʊ", // hood
    UW: "u", // two

    // Consonants
    B: "b", // be
    CH: "tʃ", // cheese
    D: "d", // dee
    DH: "ð", // thee
    F: "f", // fee
    G: "g", // green
    HH: "h", // he
    JH: "dʒ", // gee
    K: "k", // key
    L: "l", // lee
    M: "m", // me
    N: "n", // knee
    NG: "ŋ", // ping
    P: "p", // pee
    R: "r", // read
    S: "s", // sea
    SH: "ʃ", // she
    T: "t", // tea
    TH: "θ", // theta
    V: "v", // vee
    W: "w", // we
    Y: "j", // yield
    Z: "z", // zee
    ZH: "ʒ", // seizure

    // Special
    SIL: "sil", // silence
    SP: "sp", // short pause
  },

  es: {
    // Spanish vowels
    A: "a", // casa
    E: "e", // peso
    I: "i", // piso
    O: "o", // como
    U: "u", // luna

    // Spanish consonants
    B: "b", // bebé
    CH: "tʃ", // chico
    D: "d", // dado
    F: "f", // foca
    G: "g", // gato
    K: "k", // casa
    L: "l", // loco
    LL: "ʎ", // llama
    M: "m", // mamá
    N: "n", // nana
    NX: "ɲ", // niño (ñ)
    P: "p", // papá
    R: "r", // pero
    RR: "rr", // perro
    S: "s", // casa
    T: "t", // todo
    TH: "θ", // cinco (Spain)
    V: "v", // vaca
    W: "w", // hueso
    Y: "j", // hielo
    Z: "s", // zapato (most dialects)
    ZH: "ʒ", // rare in Spanish
    X: "x", // jota

    // Special
    SIL: "sil", // silence
    SP: "sp", // short pause
  },
};

// Base phoneme durations (in milliseconds) for normal speech rate
const PHONEME_DURATIONS = {
  en: {
    // Vowels (monophthongs)
    i: 75, // beat
    ɪ: 65, // bit
    e: 85, // bait
    ɛ: 80, // bet
    æ: 95, // bat
    ɑ: 130, // father
    ɔ: 110, // caught
    o: 90, // boat
    ʊ: 70, // book
    u: 85, // boot
    ʌ: 75, // but
    ə: 60, // about (schwa)
    ɝ: 95, // bird
    ɚ: 70, // butter

    // Diphthongs
    aɪ: 120, // buy
    aʊ: 125, // bow
    ɔɪ: 135, // boy
    eɪ: 110, // bay
    oʊ: 115, // bow

    // Consonants - Stops
    p: 25, // voiceless
    b: 30, // voiced
    t: 22, // voiceless
    d: 28, // voiced
    k: 30, // voiceless
    g: 35, // voiced

    // Fricatives
    f: 85, // voiceless
    v: 75, // voiced
    θ: 90, // thin
    ð: 80, // then
    s: 95, // voiceless
    z: 85, // voiced
    ʃ: 100, // ship
    ʒ: 90, // measure
    h: 60, // house

    // Affricates
    tʃ: 75, // church
    dʒ: 80, // judge

    // Nasals
    m: 70, // man
    n: 65, // name
    ŋ: 75, // sing

    // Liquids
    l: 70, // love
    r: 75, // red

    // Glides
    w: 55, // we
    j: 50, // yes

    // Silence
    sil: 100, // pause
    sp: 50, // short pause
  },

  es: {
    // Spanish vowels (more consistent durations)
    a: 85, // casa
    e: 75, // peso
    i: 65, // piso
    o: 80, // como
    u: 70, // luna

    // Consonants - Stops
    p: 20, // papá
    b: 25, // bebé
    t: 18, // todo
    d: 22, // dado
    k: 25, // casa
    g: 28, // gato

    // Fricatives
    f: 80, // foca
    θ: 85, // cinco (Spain)
    s: 90, // casa
    x: 95, // jota

    // Affricates
    tʃ: 70, // chico

    // Nasals
    m: 65, // mamá
    n: 60, // nana
    ɲ: 70, // niño

    // Liquids
    l: 65, // loco
    r: 25, // pero (tap)
    rr: 90, // perro (trill)
    ʎ: 70, // llama

    // Glides
    w: 50, // hueso
    j: 45, // hielo

    // Silence
    sil: 100, // pause
    sp: 50, // short pause
  },
};

// Contextual modification factors
const CONTEXT_FACTORS = {
  stress: {
    primary: 1.4, // Primary stressed syllable
    secondary: 1.15, // Secondary stress
    unstressed: 1.0, // No stress
  },

  position: {
    initial: 1.1, // Word/syllable initial
    medial: 1.0, // Middle position
    final: 1.3, // Word/syllable final
    phrase_final: 1.5, // End of phrase/sentence
  },

  rate: {
    very_slow: 1.8,
    slow: 1.4,
    normal: 1.0,
    fast: 0.7,
    very_fast: 0.5,
  },

  vowel_context: {
    before_voiced: 1.2, // Vowel before voiced consonant
    before_voiceless: 1.0, // Vowel before voiceless consonant
    open_syllable: 1.1, // Vowel in open syllable
  },
};

/**
 * Convert ARPAbet phoneme to IPA
 * @param {string} arpabet - ARPAbet phoneme (e.g., 'AE', 'T', 'IY')
 * @param {string} lang - Language code ('en' or 'es')
 * @returns {string} IPA phoneme symbol
 */
function arpabetToIPA(arpabet, lang = "en") {
  const baseLang = lang.toLowerCase().substring(0, 2);

  // Remove stress markers (0, 1, 2) from vowels
  const cleanArpabet = arpabet.replace(/[012]$/, "");

  if (ARPABET_TO_IPA[baseLang] && ARPABET_TO_IPA[baseLang][cleanArpabet]) {
    return ARPABET_TO_IPA[baseLang][cleanArpabet];
  }

  // Fallback to English if not found in target language
  if (baseLang !== "en" && ARPABET_TO_IPA.en[cleanArpabet]) {
    return ARPABET_TO_IPA.en[cleanArpabet];
  }

  console.warn(`ARPAbet phoneme '${arpabet}' not found, returning as-is`);
  return cleanArpabet.toLowerCase();
}

/**
 * Extract stress level from ARPAbet vowel
 * @param {string} arpabet - ARPAbet phoneme with potential stress marker
 * @returns {string} Stress level ('primary', 'secondary', 'unstressed')
 */
function getStressFromArpabet(arpabet) {
  if (arpabet.endsWith("1")) return "primary";
  if (arpabet.endsWith("2")) return "secondary";
  return "unstressed";
}
function getPhonemeCategory(phoneme) {
  const vowels = [
    "i",
    "ɪ",
    "e",
    "ɛ",
    "æ",
    "ɑ",
    "ɔ",
    "o",
    "ʊ",
    "u",
    "ʌ",
    "ə",
    "ɝ",
    "ɚ",
    "a",
  ];
  const diphthongs = ["aɪ", "aʊ", "ɔɪ", "eɪ", "oʊ"];
  const stops = ["p", "b", "t", "d", "k", "g"];
  const fricatives = ["f", "v", "θ", "ð", "s", "z", "ʃ", "ʒ", "h", "x"];
  const nasals = ["m", "n", "ŋ", "ɲ"];
  const liquids = ["l", "r", "rr", "ʎ"];

  if (vowels.includes(phoneme)) return "vowel";
  if (diphthongs.includes(phoneme)) return "diphthong";
  if (stops.includes(phoneme)) return "stop";
  if (fricatives.includes(phoneme)) return "fricative";
  if (nasals.includes(phoneme)) return "nasal";
  if (liquids.includes(phoneme)) return "liquid";
  return "other";
}

// Check if consonant is voiced
function isVoicedConsonant(phoneme) {
  const voicedConsonants = [
    "b",
    "d",
    "g",
    "v",
    "ð",
    "z",
    "ʒ",
    "dʒ",
    "m",
    "n",
    "ŋ",
    "ɲ",
    "l",
    "r",
    "rr",
    "ʎ",
    "w",
    "j",
  ];
  return voicedConsonants.includes(phoneme);
}

/**
 * Calculate phoneme duration with contextual factors
 * @param {string} phoneme - ARPAbet phoneme symbol (e.g., 'AE1', 'T', 'IY0')
 * @param {Object} context - Contextual information
 * @param {string} context.lang - Language code ('en' or 'es')
 * @param {string} context.stress - Stress level (optional - will be extracted from ARPAbet if present)
 * @param {string} context.position - Position in word ('initial', 'medial', 'final', 'phrase_final')
 * @param {string} context.rate - Speaking rate ('very_slow', 'slow', 'normal', 'fast', 'very_fast')
 * @param {string} context.nextPhoneme - Following phoneme (ARPAbet format)
 * @param {string} context.prevPhoneme - Preceding phoneme (ARPAbet format)
 * @param {boolean} context.openSyllable - Whether vowel is in open syllable
 * @returns {number} Duration in milliseconds
 */
function getPhonemeDuration(phoneme, context = {}) {
  const {
    lang = "en",
    position = "medial",
    rate = "normal",
    nextPhoneme = null,
    prevPhoneme = null,
    openSyllable = false,
  } = context;

  // Get base language (first two characters)
  const baseLang = lang.toLowerCase().substring(0, 2);

  // Convert ARPAbet to IPA
  const ipaPhoneme = arpabetToIPA(phoneme, baseLang);

  // Extract stress from ARPAbet (overrides context.stress if present)
  let stress = context.stress || getStressFromArpabet(phoneme);

  // Check if language is supported
  if (!PHONEME_DURATIONS[baseLang]) {
    console.warn(
      `Language '${baseLang}' not supported, falling back to English`
    );
    baseLang = "en";
  }

  // Get base duration using IPA phoneme
  let duration = PHONEME_DURATIONS[baseLang][ipaPhoneme];

  // If phoneme not found, use category-based fallback
  if (!duration) {
    const category = getPhonemeCategory(ipaPhoneme);
    const fallbackDurations = {
      en: {
        vowel: 80,
        diphthong: 120,
        stop: 25,
        fricative: 85,
        nasal: 65,
        liquid: 70,
        other: 60,
      },
      es: {
        vowel: 75,
        diphthong: 110,
        stop: 22,
        fricative: 85,
        nasal: 60,
        liquid: 65,
        other: 55,
      },
    };
    duration = fallbackDurations[baseLang][category] || 60;
    console.warn(
      `Phoneme '${ipaPhoneme}' (from ARPAbet '${phoneme}') not found, using category fallback: ${duration}ms`
    );
  }

  // Apply contextual modifications
  duration *= CONTEXT_FACTORS.stress[stress] || 1.0;
  duration *= CONTEXT_FACTORS.position[position] || 1.0;
  duration *= CONTEXT_FACTORS.rate[rate] || 1.0;

  // Special vowel lengthening rules
  const phonemeCategory = getPhonemeCategory(ipaPhoneme);
  if (phonemeCategory === "vowel" || phonemeCategory === "diphthong") {
    // Convert next phoneme to IPA for voice checking
    if (nextPhoneme) {
      const nextIPA = arpabetToIPA(nextPhoneme, baseLang);
      if (isVoicedConsonant(nextIPA)) {
        duration *= CONTEXT_FACTORS.vowel_context.before_voiced;
      }
    }

    // Vowels are longer in open syllables
    if (openSyllable) {
      duration *= CONTEXT_FACTORS.vowel_context.open_syllable;
    }
  }

  // Ensure minimum duration
  duration = Math.max(duration, 10);

  return Math.round(duration);
}

/**
 * Calculate duration for a sequence of phonemes
 * @param {Array} phonemes - Array of ARPAbet phoneme objects with phoneme and context
 * @param {Object} globalContext - Global context applied to all phonemes
 * @returns {Array} Array of durations in milliseconds
 */
function getSequenceDurations(phonemes, globalContext = {}) {
  const copyOfArrOfPhonemes = JSON.parse(JSON.stringify(phonemes));
  return copyOfArrOfPhonemes.map((item, index) => {
    const phoneme = typeof item === "string" ? item : item.phoneme;
    const localContext = typeof item === "object" ? item.context || {} : {};

    // Merge global and local context
    const context = { ...globalContext, ...localContext };

    // Add next/previous phoneme context
    if (index > 0) {
      const prevItem = phonemes[index - 1];
      context.prevPhoneme =
        typeof prevItem === "string" ? prevItem : prevItem.phoneme;
    }
    if (index < phonemes.length - 1) {
      const nextItem = phonemes[index + 1];
      context.nextPhoneme =
        typeof nextItem === "string" ? nextItem : nextItem.phoneme;
    }

    return {
      phoneme,
      duration: getPhonemeDuration(phoneme, context),
      context,
    };
  });
}

// Example usage:
/*
// Simple usage with ARPAbet
console.log(getPhonemeDuration('AE1')); // Primary stressed 'æ' sound
console.log(getPhonemeDuration('T'));   // 't' sound

// With context
console.log(getPhonemeDuration('AE1', {
  position: 'final',
  rate: 'slow',
  nextPhoneme: 'T'
}));

// Sequence processing
const word = ['HH', 'EH1', 'L', 'OW0'];
const durations = getSequenceDurations(word, { rate: 'normal' });
console.log(durations);
*/
