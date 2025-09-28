// Professional Text Sanitizer - Battle-tested Unicode cleaning
// Handles: zero-widths, BOMs, soft hyphens, bidi controls, TAGs, variation selectors, 
// noncharacters, private use, stray combining marks, control chars, markup, and normalizes

const INVISIBLES = new Set([
  "\u200B","\u200C","\u200D","\u200E","\u200F",
  "\u202A","\u202B","\u202C","\u202D","\u202E",
  "\u2066","\u2067","\u2068","\u2069","\u2060",
  "\u00AD","\u180E","\uFEFF"
]);

const CONTROL_RE = /[\u0000-\u001F\u007F]/g;
const HTML_TAG_RE = /<(script|style)[\s\S]*?<\/\1>|<[^>]+>/gis;
const MD_FENCE_RE = /^```[\s\S]*?^```$/gm;
const MD_INLINE_RE = /(`[^`]*`)|(\*\*?|__?|~~|>\s)/gm;

function isTagChar(ch: string): boolean {
  const cp = ch.codePointAt(0);
  return cp !== undefined && cp >= 0xE0000 && cp <= 0xE007F;
}

function isVariationSelector(ch: string, keepEmoji = false, keepAll = false): boolean {
  const cp = ch.codePointAt(0);
  if (!cp) return false;
  if (keepAll) return false;
  if (keepEmoji && (cp === 0xFE0E || cp === 0xFE0F)) return false;
  return (cp >= 0xFE00 && cp <= 0xFE0F) || (cp >= 0xE0100 && cp <= 0xE01EF);
}

function isNonCharacter(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (!cp) return false;
  if (cp >= 0xFDD0 && cp <= 0xFDEF) return true;
  return (cp & 0xFFFF) === 0xFFFE || (cp & 0xFFFF) === 0xFFFF;
}

function isPrivateUse(ch: string, scope: string): boolean {
  const cp = ch.codePointAt(0);
  if (!cp) return false;
  if (scope === "none") return false;
  if (cp >= 0xE000 && cp <= 0xF8FF) return true;
  if (scope === "all" && ((cp >= 0xF0000 && cp <= 0xFFFFD) || (cp >= 0x100000 && cp <= 0x10FFFD))) return true;
  return false;
}

function stripMarkup(text: string, markupConfig: any): string {
  if (markupConfig.html_xml) {
    text = text.replace(HTML_TAG_RE, " ");
    // Simple HTML entity decoding
    text = text.replace(/&(#\d+|#x[0-9A-Fa-f]+|\w+);/g, (entity) => {
      const temp = document.createElement("textarea");
      temp.innerHTML = entity;
      return temp.textContent || entity;
    });
  }
  if (markupConfig.code_fences) {
    text = text.replace(MD_FENCE_RE, " ");
  }
  if (markupConfig.markdown) {
    text = text.replace(MD_INLINE_RE, " ");
    text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, " ");
    text = text.replace(/\[([^\]]*)\]\([^)]+\)/g, "$1");
  }
  return text;
}

function collapseWhitespace(text: string): string {
  return text
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export interface SanitizerProfile {
  version: string;
  normalize: string;
  nfkc_compat: boolean;
  collapse_whitespace: boolean;
  strip_markup: {
    html_xml: boolean;
    markdown: boolean;
    code_fences: boolean;
  };
  remove_categories: {
    Cc_controls: boolean;
    Cf_format_controls: boolean;
    Cs_surrogates: boolean;
  };
  remove_noncharacters: boolean;
  remove_private_use: string;
  remove_isolated_combining_marks: boolean;
  strip_directionality_controls: boolean;
  strip_soft_hyphen_discretionary: boolean;
  strip_invisible_separators: boolean;
  strip_tag_chars: boolean;
  strip_variation_selectors: string;
  strip_bom_anywhere: boolean;
  language_overrides: Record<string, {
    allow: string[];
    comments?: string;
  }>;
  hard_allowlist: string[];
  hard_blocklist: string[];
}

export function sanitizeText(text: string, profile: SanitizerProfile, lang?: string): string {
  if (!text || typeof text !== 'string') return '';

  // 1) Optional markup strip
  if (profile.strip_markup && (profile.strip_markup.html_xml || profile.strip_markup.markdown)) {
    text = stripMarkup(text, profile.strip_markup);
  }

  // 2) Normalize early (optionally NFKC for aggressive compatibility)
  text = profile.nfkc_compat ? text.normalize("NFKC") : text.normalize(profile.normalize || "NFC");

  // 3) Build allowlist for the selected language
  const langAllow = new Set((profile.language_overrides?.[lang || ""]?.allow) || []);
  const hardAllow = new Set(profile.hard_allowlist || []);
  const allow = new Set([...langAllow, ...hardAllow]);

  // 4) Character-by-character filtering
  const keepEmojiVS = profile.strip_variation_selectors === "emoji_safekeep";
  const keepAllVS = profile.strip_variation_selectors === "none";

  const out: string[] = [];
  for (const ch of text) {
    // Hard allow always wins
    if (allow.has(ch)) {
      out.push(ch);
      continue;
    }

    // Controls
    if (profile.remove_categories?.Cc_controls && CONTROL_RE.test(ch)) {
      continue;
    }
    CONTROL_RE.lastIndex = 0; // reset

    // BOM anywhere
    if (profile.strip_bom_anywhere && ch === "\uFEFF") {
      continue;
    }

    // Format controls (Cf)
    if (profile.remove_categories?.Cf_format_controls && /\p{Cf}/u.test(ch)) {
      if (allow.has(ch)) out.push(ch);
      continue;
    }

    // Invisibles common set
    if (profile.strip_invisible_separators && INVISIBLES.has(ch) && !allow.has(ch)) {
      continue;
    }

    // Soft hyphen discretionary
    if (profile.strip_soft_hyphen_discretionary && ch === "\u00AD") {
      continue;
    }

    // Tag chars
    if (profile.strip_tag_chars && isTagChar(ch)) {
      continue;
    }

    // Variation selectors
    if ((profile.strip_variation_selectors === "all" || profile.strip_variation_selectors === "emoji_safekeep") && 
        isVariationSelector(ch, keepEmojiVS, keepAllVS)) {
      continue;
    }

    // Noncharacters
    if (profile.remove_noncharacters && isNonCharacter(ch)) {
      continue;
    }

    // Private-use
    if (isPrivateUse(ch, profile.remove_private_use || "all")) {
      continue;
    }

    out.push(ch);
  }

  text = out.join("");

  // 5) Strip bidi controls if requested
  if (profile.strip_directionality_controls) {
    text = text.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, "");
  }

  // 6) Remove isolated combining marks if requested
  if (profile.remove_isolated_combining_marks) {
    // Drop marks not following a base character
    text = text.replace(/(^|[^\p{L}\p{N}])\p{M}+/gu, (match, prefix) => prefix);
  }

  // 7) Collapse whitespace / newlines
  if (profile.collapse_whitespace) {
    text = collapseWhitespace(text);
  }

  // 8) Final normalize pass
  text = text.normalize(profile.normalize || "NFC");
  
  return text;
}

// Preset configurations for common use cases
export const PRESET_PROFILES = {
  EMOJI_SAFE: {
    version: "1.2",
    normalize: "NFC",
    nfkc_compat: false,
    collapse_whitespace: true,
    strip_markup: { html_xml: true, markdown: true, code_fences: true },
    remove_categories: { Cc_controls: true, Cf_format_controls: true, Cs_surrogates: true },
    remove_noncharacters: true,
    remove_private_use: "all",
    remove_isolated_combining_marks: true,
    strip_directionality_controls: true,
    strip_soft_hyphen_discretionary: true,
    strip_invisible_separators: true,
    strip_tag_chars: true,
    strip_variation_selectors: "emoji_safekeep",
    strip_bom_anywhere: true,
    language_overrides: {},
    hard_allowlist: ["\uFE0E", "\uFE0F"],
    hard_blocklist: ["\u2060", "\u00AD", "\u180E", "\uFEFF"]
  } as SanitizerProfile,

  MAX_STERILE: {
    version: "1.2",
    normalize: "NFC",
    nfkc_compat: true,
    collapse_whitespace: true,
    strip_markup: { html_xml: true, markdown: true, code_fences: true },
    remove_categories: { Cc_controls: true, Cf_format_controls: true, Cs_surrogates: true },
    remove_noncharacters: true,
    remove_private_use: "all",
    remove_isolated_combining_marks: true,
    strip_directionality_controls: true,
    strip_soft_hyphen_discretionary: true,
    strip_invisible_separators: true,
    strip_tag_chars: true,
    strip_variation_selectors: "all",
    strip_bom_anywhere: true,
    language_overrides: {},
    hard_allowlist: [],
    hard_blocklist: ["\u2060", "\u00AD", "\u180E", "\uFEFF"]
  } as SanitizerProfile,

  MARKUP_INTACT: {
    version: "1.2",
    normalize: "NFC",
    nfkc_compat: false,
    collapse_whitespace: true,
    strip_markup: { html_xml: false, markdown: false, code_fences: false },
    remove_categories: { Cc_controls: true, Cf_format_controls: true, Cs_surrogates: true },
    remove_noncharacters: true,
    remove_private_use: "all",
    remove_isolated_combining_marks: true,
    strip_directionality_controls: true,
    strip_soft_hyphen_discretionary: true,
    strip_invisible_separators: true,
    strip_tag_chars: true,
    strip_variation_selectors: "emoji_safekeep",
    strip_bom_anywhere: true,
    language_overrides: {},
    hard_allowlist: ["\uFE0E", "\uFE0F"],
    hard_blocklist: ["\u2060", "\u00AD", "\u180E", "\uFEFF"]
  } as SanitizerProfile
};
