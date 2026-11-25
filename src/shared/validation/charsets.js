/*
 * Allowed-character sets, shared by filterInput (while typing) and
 * validateText (on save), so both accept exactly the same characters and
 * describe them with the same words.
 *
 * Options:
 *   allow    "digits" | "letters" | "alphanumeric" | "any"   (default "alphanumeric")
 *   spaces   allow spaces (default false)
 *   extra    extra characters allowed, as a string, e.g. ".'-_(),"
 *   decimal  allow one decimal point (".")
 */

const SETS = {
  digits: { chars: "0-9", words: ["numbers"] },
  letters: { chars: "A-Za-z", words: ["letters"] },
  alphanumeric: { chars: "A-Za-z0-9", words: ["letters", "numbers"] },
  any: { chars: null, words: [] },
};

const escapeForClass = (text) => text.replace(/[\\\]^-]/g, "\\$&");

const joinWords = (words) =>
  words.length <= 1
    ? words.join("")
    : `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;

/* Returns { invalidChar: RegExp (global), describe: "letters, spaces and . '", onlyDigits } */
export const buildCharset = ({ allow = "alphanumeric", spaces = false, extra = "", decimal = false } = {}) => {
  const set = SETS[allow] || SETS.alphanumeric;
  const extraChars = [...new Set(String(extra).split(""))].filter((c) => c !== " " && !(decimal && c === "."));

  const words = [...set.words];
  if (spaces) words.push("spaces");
  if (decimal) words.push("decimal point");

  let describe;
  if (extraChars.length) {
    describe = `${words.join(", ")}${words.length ? " and " : ""}${extraChars.join(" ")}`;
  } else {
    describe = joinWords(words);
  }

  let invalidChar;
  if (set.chars === null) {
    // "any": everything allowed except (optionally) whitespace
    invalidChar = spaces ? /(?!)/g : /\s/g;
  } else {
    const cls = set.chars + (spaces ? "\\s" : "") + (decimal ? "." : "") + escapeForClass(extraChars.join(""));
    invalidChar = new RegExp(`[^${cls}]`, "g"); // "." is literal inside [...]
  }

  return {
    invalidChar,
    describe,
    onlyDigits: allow === "digits" && !spaces && !decimal && !extraChars.length,
  };
};

export const hasInvalidChars = (text, charset) => {
  charset.invalidChar.lastIndex = 0;
  const found = charset.invalidChar.test(text);
  charset.invalidChar.lastIndex = 0;
  return found;
};
