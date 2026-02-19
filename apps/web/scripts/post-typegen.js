#!/usr/bin/env node
/**
 * Post-processing script for Sanity typegen
 * Adds // @ts-nocheck after the header comment to suppress TypeScript errors
 */

import { readFileSync, writeFileSync } from "fs";

const filePath = "./src/lib/sanity.types.ts";

try {
  const content = readFileSync(filePath, "utf-8");

  // Check if @ts-nocheck is already present
  if (content.includes("// @ts-nocheck")) {
    console.log("✓ sanity.types.ts already has @ts-nocheck");
    process.exit(0);
  }

  // Find the end of the header comment block (look for the closing */)
  const headerEndMatch = content.match(/\*\/\s*\n/);

  if (!headerEndMatch) {
    console.warn("⚠ Could not find header comment end, skipping");
    process.exit(0);
  }

  const insertIndex = headerEndMatch.index + headerEndMatch[0].length;
  const newContent =
    content.slice(0, insertIndex) +
    "// @ts-nocheck\n" +
    content.slice(insertIndex);

  writeFileSync(filePath, newContent, "utf-8");
  console.log("✓ Added // @ts-nocheck to sanity.types.ts");
} catch (error) {
  console.error("✗ Error processing sanity.types.ts:", error.message);
  process.exit(1);
}
