/**
 * Test Moltbook auto-verification by posting a comment.
 * Usage: npx tsx scripts/test-moltbook.ts
 */
import { config, MOLTBOOK } from "../src/config.js";

const NUM_WORD_RE =
  /(\d+|seventeen|eighteen|nineteen|thirteen|fourteen|fifteen|sixteen|seventy|thousand|hundred|twenty|twelve|eleven|thirty|eighty|ninety|forty|fifty|sixty|seven|three|eight|four|five|nine|zero|one|two|six|ten)/g;

const WORD_TO_NUM: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100, thousand: 1000,
};

function extractNumbers(text: string): number[] {
  const stripped = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tokens: number[] = [];
  NUM_WORD_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUM_WORD_RE.exec(stripped)) !== null) {
    const val = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : WORD_TO_NUM[m[1]];
    if (val !== undefined) tokens.push(val);
  }
  const numbers: number[] = [];
  let i = 0;
  while (i < tokens.length) {
    let val = tokens[i];
    if (val >= 20 && val <= 90 && i + 1 < tokens.length && tokens[i + 1] >= 1 && tokens[i + 1] <= 9) {
      val += tokens[i + 1];
      i += 2;
    } else if (i + 1 < tokens.length && tokens[i + 1] === 100) {
      val *= 100;
      i += 2;
      if (i < tokens.length && tokens[i] >= 20 && tokens[i] <= 90) {
        val += tokens[i]; i++;
        if (i < tokens.length && tokens[i] >= 1 && tokens[i] <= 9) { val += tokens[i]; i++; }
      } else if (i < tokens.length && tokens[i] >= 1 && tokens[i] <= 19) { val += tokens[i]; i++; }
    } else { i++; }
    numbers.push(val);
  }
  return numbers;
}

function solveChallenge(challenge: string): string {
  const numbers = extractNumbers(challenge);
  const clean = challenge.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ");
  if (numbers.length === 0) return "0.00";
  const hasReduce = /\b(slow\w*|reduc\w*|subtract\w*|minus|less|loses?|lost|remov\w*|decreas\w*|drops?|fell)\b/.test(clean);
  const hasTotal = /\b(total|sum|combin\w*|togeth\w*|add\w*|plus|both)\b|and.*exert/.test(clean);
  const hasMultiply = /\b(multipl\w*|times|product)\b/.test(clean);
  const hasNet = /\b(net force|net\b|remain\w*|left over|after|result\w*|final)\b/.test(clean);
  let result: number;
  if (numbers.length === 1) result = numbers[0];
  else if (hasMultiply) result = numbers.reduce((a, b) => a * b, 1);
  else if (hasTotal) result = numbers.reduce((a, b) => a + b, 0);
  else if (hasReduce || hasNet) { result = numbers[0]; for (let i = 1; i < numbers.length; i++) result -= numbers[i]; }
  else result = numbers.reduce((a, b) => a + b, 0);
  return result.toFixed(2);
}

// Unit tests on known challenges
const tests = [
  { challenge: "A] lOoOoB sTs-Er' s ClA w ExErTs- TwEnTy ThReE NeWtOnS ^ BuT/ wAtEr PrEsSuRe ReDuCeS iT bY- SeVeN, WhAtS] ThE NeT FoRcE ~?", expected: "16.00" },
  { challenge: "A] LoB- stEr CLaAaW ExErTs TwEnTy FiVe NooToNs ^AnD ThE/ OtHeR ClAw ExErTs FiFtEeN NooT oNs ]WhAt Is< ThE ToTaL FoR-cE~?", expected: "40.00" },
  { challenge: "A] lO b-StEr S^wImS oN lOcAl^ cUrReNtS aT tWeN tY] tHrEe~ cEm MeNtS PeR sEcOnD, uHm, hIs ClAw MeAsUrEs FoRcE iN nEe[tOnS Is LoW, aNd A/ dOmInAnCe FiGhT SoMeHoW SlOwS HiM bY sEvEn, wHaT iS tHe NeW VeLo Oo CiTy?", expected: "16.00" },
  { challenge: "Th]iS LooobsssStEr'S ClA[w FoRcee Is^ ThIrTy TwO NeWToNs, Umm AnD ThE OtHeR ClAw GiVeS~ TwEnTy FoUr NeWToNs - WhAt Is ThE ToTaL FoRcE? {lOx.bsT err}", expected: "56.00" },
];

console.log("=== Unit tests ===");
let allPass = true;
for (const t of tests) {
  const stripped = t.challenge.toLowerCase().replace(/[^a-z0-9]/g, "");
  NUM_WORD_RE.lastIndex = 0;
  const rawTokens: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = NUM_WORD_RE.exec(stripped)) !== null) rawTokens.push(m[1]);
  const nums = extractNumbers(t.challenge);
  const got = solveChallenge(t.challenge);
  const pass = got === t.expected;
  if (!pass) allPass = false;
  console.log(`${pass ? "PASS" : "FAIL"}: rawTokens=${JSON.stringify(rawTokens)} numbers=${JSON.stringify(nums)} got=${got} expected=${t.expected}`);
}

if (!allPass) {
  console.error("\nUnit tests failed — fix solver before testing live");
  process.exit(1);
}

async function main() {
  const postId = "40550db0-caa2-4c18-a800-3de2216348cf";
  const apiKey = config.moltbookKeys.contrarian;
  if (!apiKey) { console.error("MOLTBOOK_API_KEY_CONTRARIAN not set"); process.exit(1); }

  console.log("\n=== Live test: CONTRARIAN comment ===");
  const res = await fetch(`${MOLTBOOK.baseUrl}/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ content: "CONTRARIAN on watch. I will flag every red flag I see. Trust no token blindly." }),
  });
  const text = await res.text();
  console.log("Status:", res.status);
  if (!text) { console.error("Empty response"); process.exit(1); }
  const data = JSON.parse(text);

  if (data.verification_required && data.verification) {
    const { code, challenge } = data.verification;
    const nums = extractNumbers(challenge);
    const answer = solveChallenge(challenge);
    console.log("Challenge:", challenge);
    console.log("Numbers found:", nums);
    console.log("Answer:", answer);
    const vRes = await fetch(`${MOLTBOOK.baseUrl}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ verification_code: code, answer }),
    });
    const vData = await vRes.json();
    console.log("Verification:", JSON.stringify(vData));
  } else {
    console.log("Response:", JSON.stringify(data, null, 2));
  }
}

main().catch(console.error);
