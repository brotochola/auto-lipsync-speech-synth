class PhonemeConverter {
  constructor(wordToPhonemeDict = {}) {
    this.dictionary = wordToPhonemeDict;

    // Common phonetic patterns and rules using ARPABET-style ASCII phonemes
    this.patterns = [
      // Consonant clusters
      { pattern: /^ch/i, phoneme: "CH" },
      { pattern: /^sh/i, phoneme: "SH" },
      { pattern: /^th/i, phoneme: "TH" },
      { pattern: /^ph/i, phoneme: "F" },
      { pattern: /^wh/i, phoneme: "W" },
      { pattern: /ck$/i, phoneme: "K" },
      { pattern: /ng$/i, phoneme: "NG" },

      // Vowel patterns
      { pattern: /ee/i, phoneme: "IY" },
      { pattern: /ea/i, phoneme: "IY" },
      { pattern: /oo/i, phoneme: "UW" },
      { pattern: /ou/i, phoneme: "AW" },
      { pattern: /ow/i, phoneme: "AW" },
      { pattern: /ai/i, phoneme: "EY" },
      { pattern: /ay/i, phoneme: "EY" },
      { pattern: /oi/i, phoneme: "OY" },
      { pattern: /oy/i, phoneme: "OY" },
      { pattern: /ar/i, phoneme: "AA R" },
      { pattern: /er$/i, phoneme: "ER" },
      { pattern: /or/i, phoneme: "AO R" },
      { pattern: /ir/i, phoneme: "IH R" },
      { pattern: /ur/i, phoneme: "ER" },

      // Single consonants
      { pattern: /b/i, phoneme: "B" },
      { pattern: /c(?=[eiy])/i, phoneme: "S" }, // soft c
      { pattern: /c/i, phoneme: "K" }, // hard c
      { pattern: /d/i, phoneme: "D" },
      { pattern: /f/i, phoneme: "F" },
      { pattern: /g(?=[eiy])/i, phoneme: "JH" }, // soft g
      { pattern: /g/i, phoneme: "G" }, // hard g
      { pattern: /h/i, phoneme: "HH" },
      { pattern: /j/i, phoneme: "JH" },
      { pattern: /k/i, phoneme: "K" },
      { pattern: /l/i, phoneme: "L" },
      { pattern: /m/i, phoneme: "M" },
      { pattern: /n/i, phoneme: "N" },
      { pattern: /p/i, phoneme: "P" },
      { pattern: /q/i, phoneme: "K W" },
      { pattern: /r/i, phoneme: "R" },
      { pattern: /s/i, phoneme: "S" },
      { pattern: /t/i, phoneme: "T" },
      { pattern: /v/i, phoneme: "V" },
      { pattern: /w/i, phoneme: "W" },
      { pattern: /x/i, phoneme: "K S" },
      { pattern: /y(?=[aeiou])/i, phoneme: "Y" }, // consonant y
      { pattern: /y/i, phoneme: "AY" }, // vowel y
      { pattern: /z/i, phoneme: "Z" },

      // Single vowels (context-dependent)
      { pattern: /a(?=.*e$)/i, phoneme: "EY" }, // magic e
      { pattern: /a/i, phoneme: "AE" },
      { pattern: /e$/i, phoneme: "" }, // silent e
      { pattern: /e/i, phoneme: "EH" },
      { pattern: /i(?=.*e$)/i, phoneme: "AY" }, // magic e
      { pattern: /i/i, phoneme: "IH" },
      { pattern: /o(?=.*e$)/i, phoneme: "OW" }, // magic e
      { pattern: /o/i, phoneme: "AA" },
      { pattern: /u(?=.*e$)/i, phoneme: "UW" }, // magic e
      { pattern: /u/i, phoneme: "AH" },
    ];
  }

  // Add words to the dictionary
  addToDictionary(wordPhonemeMap) {
    Object.assign(this.dictionary, wordPhonemeMap);
  }

  // Convert word to phonemes
  wordToPhonemes(word) {
    if (!word) return [];

    const normalizedWord = word.toLowerCase().trim();

    // First check if word exists in dictionary
    if (this.dictionary[normalizedWord]) {
      return Array.isArray(this.dictionary[normalizedWord])
        ? this.dictionary[normalizedWord]
        : this.dictionary[normalizedWord].split(" ");
    }

    // If not in dictionary, use pattern matching
    return this.patternBasedConversion(normalizedWord);
  }

  // Pattern-based phoneme conversion
  patternBasedConversion(word) {
    let phonemes = [];
    let remaining = word;
    let position = 0;

    while (position < word.length) {
      let matched = false;

      // Try to match patterns starting from current position
      for (const rule of this.patterns) {
        const substr = remaining.slice(position);
        const match = substr.match(rule.pattern);

        if (match && match.index === 0) {
          if (rule.phoneme) {
            // Skip empty phonemes (like silent e)
            if (rule.phoneme.includes(" ")) {
              // Split multi-phoneme sequences
              phonemes.push(...rule.phoneme.split(" "));
            } else {
              phonemes.push(rule.phoneme);
            }
          }
          position += match[0].length;
          matched = true;
          break;
        }
      }

      // If no pattern matched, skip the character
      if (!matched) {
        position++;
      }
    }

    return phonemes.filter((p) => p.length > 0);
  }

  // Enhanced conversion with syllable awareness
  advancedWordToPhonemes(word) {
    const basicPhonemes = this.wordToPhonemes(word);

    // Apply post-processing rules
    return this.applyPostProcessingRules(basicPhonemes, word.toLowerCase());
  }

  // Apply phonological rules and corrections
  applyPostProcessingRules(phonemes, originalWord) {
    let processed = [...phonemes];

    // Handle common exceptions and improvements
    if (originalWord.endsWith("tion")) {
      // Replace final part with proper phonemes for -tion
      const index = processed.lastIndexOf("T");
      if (index !== -1) {
        processed.splice(index, processed.length - index, "SH", "AH", "N");
      }
    }

    if (originalWord.endsWith("sion")) {
      // Replace final part with proper phonemes for -sion
      const index = processed.lastIndexOf("S");
      if (index !== -1) {
        processed.splice(index, processed.length - index, "ZH", "AH", "N");
      }
    }

    // Remove duplicate consecutive phonemes
    processed = processed.filter(
      (phoneme, index) => index === 0 || phoneme !== processed[index - 1]
    );

    return processed;
  }

  // Batch convert multiple words
  convertBatch(words) {
    return words.map((word) => ({
      word: word,
      phonemes: this.wordToPhonemes(word),
    }));
  }

  // Get phoneme string (space-separated)
  getPhonemeString(word) {
    return this.wordToPhonemes(word).join(" ");
  }

  // Check if word is in dictionary
  isInDictionary(word) {
    return this.dictionary.hasOwnProperty(word.toLowerCase().trim());
  }

  // Get statistics about dictionary coverage
  getCoverage(wordList) {
    const total = wordList.length;
    const covered = wordList.filter((word) => this.isInDictionary(word)).length;
    return {
      total: total,
      covered: covered,
      uncovered: total - covered,
      coveragePercent: ((covered / total) * 100).toFixed(2),
    };
  }
}
