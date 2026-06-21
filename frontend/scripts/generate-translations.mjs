#!/usr/bin/env node
// Generate static UI translations for every language in src/i18n/languages.json
// from the English source of truth (src/i18n/locales/en.json).
//
// Usage:
//   ANTHROPIC_API_KEY=sk-... node scripts/generate-translations.mjs            # fill missing keys for all languages
//   ANTHROPIC_API_KEY=sk-... node scripts/generate-translations.mjs --force    # re-translate everything
//   ANTHROPIC_API_KEY=sk-... node scripts/generate-translations.mjs --lang=es,fr
//
// Output is written as static src/i18n/locales/<code>.json files, which the app
// loads at runtime. English is the source and is never generated.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const localesDir = resolve(root, "src/i18n/locales");
const enPath = resolve(localesDir, "en.json");
const langsPath = resolve(root, "src/i18n/languages.json");

const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const CHUNK_SIZE = 25;
const MAX_TOKENS = 16384;
const RETRIES = 2;

if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. Add it to your environment and re-run.");
  process.exit(1);
}

// English display names so the model knows the target unambiguously (the
// endonyms in languages.json are for users, not always clear instructions).
const ENGLISH_NAMES = {
  es: "Spanish", zh: "Chinese (Simplified)", vi: "Vietnamese", tl: "Tagalog",
  ko: "Korean", ar: "Arabic", ru: "Russian", ht: "Haitian Creole", fr: "French",
  pt: "Portuguese", hi: "Hindi", bn: "Bengali", ur: "Urdu", pa: "Punjabi (Gurmukhi)",
  pl: "Polish", ja: "Japanese", km: "Khmer", hmn: "Hmong (White Hmong)", so: "Somali",
  am: "Amharic", fa: "Persian (Farsi)", de: "German", it: "Italian"
};

const args = process.argv.slice(2);
const force = args.includes("--force");
const langArg = args.find((a) => a.startsWith("--lang="));
const onlyLangs = langArg ? langArg.slice("--lang=".length).split(",").map((s) => s.trim()) : null;

const en = JSON.parse(readFileSync(enPath, "utf8"));
const languages = JSON.parse(readFileSync(langsPath, "utf8"));
const enKeys = Object.keys(en);

const SYSTEM_PROMPT = [
  "You are a professional localizer for a US public-benefits navigator web app (\"Aid Compass\").",
  "You translate short UI strings from English into a target language.",
  "Rules:",
  "- Translate the VALUES only. Return a JSON object with the SAME keys you were given.",
  "- Preserve every placeholder token exactly, e.g. {count}, {amount}, {state}, {program}, {year}. Do not translate or reorder the braces' contents.",
  "- Preserve inline markup tags exactly: <em> and </em> must remain, wrapping the same conceptual phrase.",
  "- Keep program acronyms unchanged: SNAP, WIC, TANF, CHIP, LIHEAP, Medicaid.",
  "- Keep brand/product names unchanged: Aid Compass, Compass, Supabase, Clerk, Google Calendar, Google Places, OpenStreetMap.",
  "- Keep symbols and formatting such as $, %, ·, —, “ ”, and leading/trailing spaces.",
  "- Use natural, warm, plain language appropriate for people seeking government assistance.",
  "- Output ONLY the JSON object. No commentary, no code fences."
].join("\n");

function stripFences(text) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

// Tolerant parser for the flat {key: string} object the model returns.
// Some languages (notably Chinese) occasionally emit an unescaped " inside a
// value, which breaks strict JSON.parse. Because we know exactly which keys to
// expect and their order, we can anchor on the next key to recover each value.
function parseFlatObject(text, keys) {
  const body = stripFences(text);
  try {
    return JSON.parse(body);
  } catch {
    // Fall through to key-anchored recovery.
  }
  const out = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const keyToken = JSON.stringify(key); // properly escaped "key"
    const keyAt = body.indexOf(keyToken);
    if (keyAt === -1) continue;
    // Position of the opening quote of the value.
    const colon = body.indexOf(":", keyAt + keyToken.length);
    if (colon === -1) continue;
    const valStart = body.indexOf('"', colon + 1);
    if (valStart === -1) continue;
    // The value ends just before the next key token, or at the final brace.
    let bound = body.length;
    for (let j = i + 1; j < keys.length; j++) {
      const nextAt = body.indexOf(JSON.stringify(keys[j]), valStart + 1);
      if (nextAt !== -1) { bound = nextAt; break; }
    }
    let raw = body.slice(valStart + 1, bound);
    // Trim trailing whitespace, the separating comma, and the closing quote.
    raw = raw.replace(/\s*,?\s*$/, "").replace(/\}\s*$/, "").replace(/\s*,?\s*$/, "");
    raw = raw.replace(/"$/, "");
    // Re-escape stray unescaped quotes so the value is clean JSON content.
    out[key] = raw
      .replace(/\\"/g, '"')      // normalize already-escaped quotes
      .replace(/\r/g, "")
      .replace(/\\n/g, "\n");
  }
  return out;
}

async function translateChunk(code, name, entries) {
  const payload = Object.fromEntries(entries);
  const userContent =
    `Target language: ${name} (BCP 47 code: ${code}).\n` +
    `Translate the values of this JSON object. Return the JSON object with identical keys.\n\n` +
    JSON.stringify(payload, null, 2);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }]
    })
  });

  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "";
  if (data?.stop_reason === "max_tokens") {
    throw new Error(`Response truncated (max_tokens) for ${code} — reduce CHUNK_SIZE.`);
  }
  return parseFlatObject(text, entries.map(([k]) => k));
}

// Retry a chunk a few times before giving up (handles truncation and transient errors).
async function translateChunkWithRetry(code, name, entries) {
  let lastError;
  for (let attempt = 1; attempt <= RETRIES + 1; attempt++) {
    try {
      return await translateChunk(code, name, entries);
    } catch (err) {
      lastError = err;
      if (attempt <= RETRIES) console.warn(`  retry ${attempt}/${RETRIES} for a ${code} chunk: ${err.message}`);
    }
  }
  throw lastError;
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function run() {
  const targets = languages
    .map((l) => l.code)
    .filter((code) => code !== "en")
    .filter((code) => !onlyLangs || onlyLangs.includes(code));

  const failed = [];
  for (const code of targets) {
    const name = ENGLISH_NAMES[code] ?? code;
    const outPath = resolve(localesDir, `${code}.json`);
    const existing = existsSync(outPath) ? JSON.parse(readFileSync(outPath, "utf8")) : {};

    const missing = force ? enKeys : enKeys.filter((k) => !(k in existing));
    if (!missing.length) {
      console.log(`✓ ${code} (${name}) — up to date`);
      continue;
    }

    console.log(`→ ${code} (${name}) — translating ${missing.length} string(s)…`);
    try {
      const result = { ...existing };
      for (const keys of chunk(missing, CHUNK_SIZE)) {
        const entries = keys.map((k) => [k, en[k]]);
        const translated = await translateChunkWithRetry(code, name, entries);
        for (const k of keys) {
          if (typeof translated[k] === "string") result[k] = translated[k];
          else {
            console.warn(`  ! missing translation for "${k}" — keeping English`);
            result[k] = en[k];
          }
        }
      }
      // Write keys in the same order as en.json for clean diffs.
      const ordered = {};
      for (const k of enKeys) if (k in result) ordered[k] = result[k];
      writeFileSync(outPath, JSON.stringify(ordered, null, 2) + "\n", "utf8");
      console.log(`  saved src/i18n/locales/${code}.json`);
    } catch (err) {
      failed.push(code);
      console.error(`  ✗ ${code} failed: ${err.message} — skipping (re-run to retry)`);
    }
  }

  if (failed.length) {
    console.log(`Done with errors. Re-run to retry: ${failed.join(", ")}`);
    process.exit(1);
  }
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
