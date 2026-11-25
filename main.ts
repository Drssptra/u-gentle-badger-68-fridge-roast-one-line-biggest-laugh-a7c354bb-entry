// Fridge Roast: One Line, Biggest Laugh — make.fun entry.
// One roast line aimed at a smart fridge: its firmware update gave it
// a grudge, and its ice maker is now the enforcer. Written to stdout
// and to $MAKEFUN_OUTPUT_DIR/entry.txt (default /output/entry.txt)
// with no trailing newline. Node 22, standard library only, deterministic.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "My smart fridge updated itself overnight and now the ice maker only works after I apologize to the vegetables rotting in its crisper.";

// The gate allows at most 200 characters, one line, not only whitespace.
const MAX_LENGTH = 200;
if (
  ENTRY.length > MAX_LENGTH ||
  ENTRY.trim().length === 0 ||
  ENTRY.includes("\n")
) {
  throw new Error("entry violates the 200-character single-line gate");
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");
process.stdout.write(ENTRY + "\n");
