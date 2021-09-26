// Copyright 2018-2021 the Deno authors. All rights reserved. MIT license.

import { encode as base64Encode } from "https://deno.land/std/encoding/base64.ts";

const PKG_NAME = "swc_wasm";
const OUTPUT_DIR = "./pkg";

// 1. build wasm
async function buildWasm(path: string) {
  const cmd = [
    "wasm-pack",
    "build",
    "--target",
    "web",
    "--release",
    "-d",
    path,
  ];
  const builder = Deno.run({ cmd });
  const status = await builder.status();

  if (!status.success) {
    console.error(`Failed to build wasm: ${status.code}`);
    Deno.exit(1);
  }
}

// 2. encode wasm
async function encodeWasm(wasmPath: string): Promise<string> {
  const wasm = await Deno.readFile(`${wasmPath}/${PKG_NAME}_bg.wasm`);
  return base64Encode(wasm);
}

// 3. generate script
async function generate(wasm: string, output: string) {
  const initScript = await Deno.readTextFile(`${output}/${PKG_NAME}.js`);
  const denoHashScript =
    "// deno-lint-ignore-file\n" +
    "//deno-fmt-ignore-file\n" +
    "//deno-lint-ignore-file\n" +
    `import {decode as base64Decode} from "https://deno.land/std/encoding/base64.ts";` +
    `export const source = base64Decode("${wasm}");` +
    initScript;

  await Deno.writeFile(
    `${OUTPUT_DIR}/wasm.js`,
    new TextEncoder().encode(denoHashScript)
  );
}

await buildWasm(OUTPUT_DIR);
const wasm = await encodeWasm(OUTPUT_DIR);
await generate(wasm, OUTPUT_DIR);
