#!/usr/bin/env node

import { handleHashfile, updateToImmutableMetadata, updateToPlaceholderMetadata, saveMetadataToDir, setupMetaplex } from './metadata_utils.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('action', {
    description: 'Action to perform (update-to-immutable, update-to-placeholder, save-current-metadata-to-dir)',
    type: 'string',
    choices: ['update-to-immutable', 'update-to-placeholder', 'save-current-metadata-to-dir'], 
    demandOption: true,
  })
  .option('file', {
    description: 'file containing valid JSON formatted list of nft hashes.',
    type: 'string',
    demandOption: true,
  })
  .option('nft-dir', {
    description: 'Directory populated with json files, each file named by the nft hash. Each json file requires \'name\' and \'uri\'.',
    type: 'string',
  })
  .option('nft-creator-address', {
    description: 'Wallet address of the nft creator to check against for updating metadata.',
    type: 'string',
  })
  .option('marketplace-api-url', {
    description: 'Marketplace api url.',
    type: 'string',
  })
  .option('metadata-name', {
    description: 'Name of placeholder update to metadata.',
    type: 'string',
  })
  .option('metadata-uri', {
    description: 'URI of placeholder update to metadata.',
    type: 'string',
  })
  .check((argv) => {
    if (['update-to-immutable', 'save-current-metadata-to-dir'].includes(argv.action) && !argv['nft-dir']) {
      throw new Error('The \'nft-dir\' option is required for the \'update-to-immutable\' actions.');
    }
    if (['update-to-immutable'].includes(argv.action) && !argv['nft-creator-address', 'marketplace-api-url']) {
      throw new Error('The \'nft-creator-address\' and \'marketplace-api-url\' options are required for the \'update-to-immutable\' actions.');
    }
    if (['update-to-placeholder'].includes(argv.action) && !argv['metadata-uri', 'metadata-name']) {
      throw new Error('The \'metadata-uri\' and \'metadata-name\' options are required for the \'update-to-placeholder\' actions.');
    }
    return true;
  })
  .help()
  .argv;

let chosenCallback;
if (argv.action === 'update-to-immutable') {
  chosenCallback = updateToImmutableMetadata;
} else if (argv.action === 'update-to-placeholder') {
  chosenCallback = updateToPlaceholderMetadata;
} else if (argv.action === 'save-current-metadata-to-dir') {
  chosenCallback = saveMetadataToDir;
}

async function main() {
  const options = {
    nftDir: argv['nft-dir'],
    nftCreatorAddress: argv['nft-creator-address'],
    metadataName: argv['metadata-name'],
    metadataUri: argv['metadata-uri'],
    marketPlaceApiUrl: argv['marketplace-api-url']
  };
  const hashFile = argv.file; 
  console.log(`Processing file: ${hashFile} with action: ${argv.action}`);
  const { metaplex } = setupMetaplex(); 
  await handleHashfile(hashFile, chosenCallback, metaplex, options);
}

main();
