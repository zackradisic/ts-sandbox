import Editor from "@monaco-editor/react";
import React, { useEffect } from "react";
import Script from "next/script";
import { Button } from "@chakra-ui/button";
import { Container, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import { useToast } from "@chakra-ui/react";
import init, { transpile } from "../swc/pkg/swc_wasm";

const starterCode = `// Write your code here
console.log('Hello World');`;

function formatOutput(output) {
  return output.toString().split(",").join("\n");
}

export default function Home() {
  const [inputCode, setInputCode] = React.useState(starterCode);
  const [compilerReady, setCompilerReady] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const toast = useToast();

  useEffect(() => {
    console.log(window.ts)
    const initWasm = async () => {
      await init();
    };
    initWasm();
    console.stdlog = console.log.bind(console);
    console.log = function () {
      setLogs((logs) => [...logs, Array.from(arguments)]);
      console.stdlog.apply(console, arguments);
    };
  }, []);

  const clearLogs = React.useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  const compileAndExecute = React.useCallback(() => {
    clearLogs();
    const code = inputCode;
    const start = Date.now();
    const jsCode = transpile(code, {
      jsc: {
        parser: {
          syntax: "typescript",
        },
        target: "es2020",
      },
      module: {
        type: "es6",
      },
    });
    console.log(`Elapsed: ${Date.now() - start} `);
    eval(jsCode);
  }, [inputCode, clearLogs]);

  const copyOutput = React.useCallback(() => {
    navigator.clipboard.writeText(formatOutput(logs));
    toast({
      title: "Output copied to clipboard.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [logs, toast]);

  return (
    <>
      <Head>
        <title>TS Sandbox</title>
      </Head>
      <Script
        onLoad={() => setCompilerReady(true)}
        src="https://unpkg.com/typescript@latest/lib/typescriptServices.js"
      />
      <Container padding="5">
        <VStack
          spacing={4}
          onKeyUp={(e) => {
            if (e.ctrlKey && e.keyCode === 13) {
              compileAndExecute();
              setInputCode((input) => input.slice(0, input.length - 1));
            }
          }}
        >
          <Editor
            height="50vh"
            width="100%"
            language="typescript"
            defaultValue={starterCode}
            value={inputCode}
            onChange={setInputCode}
            theme="vs-dark"
          />

          <Button
            backgroundColor="green.200"
            onClick={compileAndExecute}
            disabled={!compilerReady}
          >
            Run
          </Button>

          {logs && (
            <Editor
              defaultValue="// Output will be shown here"
              height="30vh"
              value={formatOutput(logs)}
              theme="vs-dark"
            />
          )}

          <Button onClick={copyOutput}>Copy Output</Button>
        </VStack>
      </Container>
    </>
  );
}
