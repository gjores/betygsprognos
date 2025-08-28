function normalizeSwedishGarble(text: string): string {
  // Heuristic fixes for common mis-decodes seen in SchoolSoft exports
  // when Mac OS Roman or CP1252 bytes are misinterpreted.
  return text
    // Permille sign used where 'ä' should be (e.g., "Gymnasiegemensamt ‰mne")
    .replace(/\u2030/g, "ä")
    // Modifier letter circumflex used where 'ö' should be (e.g., "fˆr" -> "för")
    .replace(/\u02C6/g, "ö")
    // Latin-1 capital A with circumflex commonly appears where 'å' should be (e.g., "MÂrdby")
    .replace(/\u00C2/g, "å")
    // Latin capital E with grave sometimes appears where 'é' is expected in names (e.g., "SvarÈn")
    .replace(/\u00C8/g, "é")
    // Latin small f with hook often appears where 'ä' should be inside words (e.g., "GRƒ")
    .replace(/\u0192/g, "ä")
    // Mac OS Roman bytes decoded as Latin-1 controls: map to Swedish letters
    .replace(/\u008A/g, "ä")
    .replace(/\u008B/g, "ö")
    .replace(/\u008C/g, "å")
    .replace(/\u0080/g, "Ä")
    .replace(/\u0085/g, "Ö")
    .replace(/\u0081/g, "Å")
}

function looksGarbled(text: string): boolean {
  // Heuristics: characters that should never appear in normal Swedish TSVs
  const garblePatterns = [
    /\u02C6/,       // ˆ (modifier letter circumflex)
    /\u2030/,       // ‰ (permille sign)
    /\u00C2/,       // Â
    /\u0192/,       // ƒ
    /\u0080|\u0081|\u0085|\u008A|\u008B|\u008C/, // MacRoman bytes seen as Latin-1 controls
    /Ã¥|Ã¤|Ã¶|Ã…|Ã„|Ã–/, // common UTF-8 mojibake for å/ä/ö
  ]
  return garblePatterns.some((rx) => rx.test(text))
}

export function decodeMaybeLatin1(input: ArrayBuffer | Uint8Array | Buffer): string {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input as ArrayBuffer)
  // Try UTF-8 first
  let text: string
  try {
    text = new TextDecoder("utf-8", { fatal: false }).decode(u8)
  } catch {
    text = Buffer.from(u8).toString("utf8")
  }
  // If UTF-8 looks fine, keep it as-is
  const replacementCount = (text.match(/\uFFFD/g) || []).length
  if (replacementCount === 0 && !looksGarbled(text))
    return text

  // Try Latin-1 (covers CP1252 in Node)
  try {
    const l1 = Buffer.from(u8).toString("latin1")
    if (!looksGarbled(l1)) return l1
    const normalized = normalizeSwedishGarble(l1)
    // If normalization removed obvious garble, use it; else fall back
    if (!looksGarbled(normalized)) return normalized
  } catch {
    // ignore
  }

  // As a last step, try normalizing the UTF-8 text if it looked garbled
  const normalizedUtf8 = normalizeSwedishGarble(text)
  if (!looksGarbled(normalizedUtf8)) return normalizedUtf8
  return text
}
