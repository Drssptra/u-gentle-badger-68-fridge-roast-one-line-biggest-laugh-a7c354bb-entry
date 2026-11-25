// Fridge Roast: One Line, Biggest Laugh — make.fun entry (v2, revised).
//
// The roast is assembled from three beats — the appliance, the betrayal,
// the punchline — then gated and emitted. The program writes exactly one
// line to $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt) with
// no trailing newline, and echoes it to stdout. Node 22, stdlib only,
// no network, fully deterministic.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const GATE = { minChars: 1, maxChars: 200 } as const;

interface GateReport {
  ok: boolean;
  problems: string[];
}

/** Build the roast from its three beats. The join keeps the line exact. */
function composeRoast(): string {
  const beats = [
    "My smart fridge's touchscreen",
    "started playing ads,",
    "so now dinner comes with a commercial break.",
  ];
  return beats.join(" ");
}

/** Run every gate rule and collect all violations instead of failing fast. */
function checkGate(text: string): GateReport {
  const problems: string[] = [];
  if (text.length < GATE.minChars) {
    problems.push("entry is empty");
  }
  if (text.length > GATE.maxChars) {
    problems.push(
      `entry is ${text.length} chars, over the ${GATE.maxChars} cap`,
    );
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (/[\r\n]/.test(text)) {
    problems.push("entry must be a single line");
  }
  if (text.endsWith("\n") || text.endsWith("\r")) {
    problems.push("entry must not end with a newline");
  }
  if (Buffer.byteLength(text, "utf8") !== text.length) {
    problems.push("entry must be plain ASCII so bytes equal characters");
  }
  return { ok: problems.length === 0, problems };
}

/** Create the output dir and write the entry as raw UTF-8 bytes. */
async function emit(text: string): Promise<string> {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const target = resolve(dir, "entry.txt");
  await mkdir(dir, { recursive: true });
  await writeFile(target, Buffer.from(text, "utf8"));
  // Read it back and prove the file is byte-exact before claiming success.
  const roundTrip = await readFile(target, "utf8");
  if (roundTrip !== text) {
    throw new Error("entry.txt round-trip mismatch after write");
  }
  return target;
}

async function main(): Promise<void> {
  const text = composeRoast();
  const gate = checkGate(text);
  if (!gate.ok) {
    throw new Error(`gate failed: ${gate.problems.join("; ")}`);
  }
  const target = await emit(text);
  process.stdout.write(`${text}\n`);
  process.stderr.write(`wrote ${text.length} chars to ${target}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
