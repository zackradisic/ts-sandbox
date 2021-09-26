import init, { transpile, source } from "./pkg/wasm.js";

await init(source);

const transpiled = transpile(
`
for (let i = 0; i < 20; i++) {
  console.log("HELLO TRANSPILED")
}
`,
  {
    jsc: {
      parser: {
        syntax: "typescript",
      },
	  target: "es2020",
    },
	module: {
		type: 'es6',
	}
  }
);

console.log('Transpiled: ', transpiled)
