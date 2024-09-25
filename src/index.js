#!/usr/bin/env node

import { handleHashfile, updateImmutableNftMetadata, saveMetadataToDir, setupMetaplex } from "./metadata_utils.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("action", {
    description: "Action to perform (updateImmutableNftMetadata, saveMetadataToDir)",
    type: "string",
    choices: ["metadata-update-immutable", "metadata-save"], 
    demandOption: true,
  })
  .option("file", {
    description: "file containing valid JSON formatted list of nft hashes.",
    type: "string",
    demandOption: true,
  })
  .help()
  .argv;


let chosenCallback;
if (argv.action === "metadata-update-immutable") {
  chosenCallback = updateImmutableNftMetadata;
} else if (argv.action === "metadata-save") {
  chosenCallback = saveMetadataToDir;
}

async function main() {
  const hashFile = argv.file; 
  console.log(`Processing file: ${hashFile} with action: ${argv.action}`);
  const { metaplex } = setupMetaplex(); 
  await handleHashfile(metaplex, hashFile, chosenCallback);
}

main();
