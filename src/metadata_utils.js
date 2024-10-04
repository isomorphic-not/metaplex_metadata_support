import { Connection, Keypair, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import axios from'axios';

dotenv.config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setupMetaplex() {
  const connection = new Connection(
    clusterApiUrl(process.env.RPC_ENDPOINT),
    'confirmed',
    { timeout: 60000 }
  );

  const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
  const wallet = Keypair.fromSecretKey(secretKey);
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  return { connection, wallet, metaplex };
}

async function processHash(mintAddress, metaplex) {
  const mintAddressObj = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mintAddressObj });
  return nft;
}

async function getHashListFromFile(hashFile) {
  const hashRegex = /^(?!.*[^A-Za-z0-9])[A-Za-z0-9]{43,44}$/;

  if (!fs.existsSync(hashFile)) {
    throw new Error(`${hashFile} does not exist.`);
  }

  const data = fs.readFileSync(hashFile, 'utf8');
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (error) {
    throw new Error(`Error parsing JSON from file ${hashFile}: ${error.message}`);
  }

  if (!Array.isArray(jsonData)) {
    throw new Error(`Expected list of hashes from ${hashFile} but got ${jsonData}`);
  }

  const invalidHash = jsonData.find(hash => !hashRegex.test(hash));
  if (invalidHash) {
    throw new Error(`Invalid hash found: ${invalidHash}`);
  }
  
  return jsonData;
}

async function updateToImmutableMetadata(nft, metaplex, nftDir) {
  const mintAddress = nft.address.toBase58(); 
  const url = 'https://api-mainnet.magiceden.dev/v2/tokens/' + mintAddress;

  const res = await axios.get(url, {
    headers: { accept: 'application/json' }
  });

  const owner = res.data.owner;
  const targetOwner = '7FnLuV5TWGmgx5ZWdUtmCqtwpwSaXRaXBVgxa2xDPBAK';

  if (owner === targetOwner) {
    console.log(`Owner wallet: ${owner}\nCreator Wallet: ${targetOwner}\nCreator is the owner of this nft, no attempt to update. Continuing...\n`);
    return;
  } 

  const nft_dir = path.join(process.cwd(), nftDir);
  if (!fs.existsSync(nft_dir)) {
    throw new Error(`Directory path ${nft_dir} containing hash files is required.`);
  }
  const filePath = path.join(nft_dir, mintAddress);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  let jsonData;
  try {
    jsonData = JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Error parsing JSON from file ${filePath}: ${error.message}`);
  }
  
  console.log('Updating...');
  while (true) {
    try {
      await metaplex.nfts().update({
        nftOrSft: nft,
        ...jsonData,
      });
      break;
    } catch (error) {
      if (error.name === 'NoInstructionsToSendError') {
        console.log('Metadata already matches, nothing to update. continuing...\n');
        return;
      } else {
        console.log('.');
        await sleep(1500);
      }
    } 
  }
  console.log(`${mintAddress} update complete!\n`);
}

async function updateToPlaceholderMetadata(nft, metaplex, _) {
  const jsonData = {
    name: 'TOKEMON BASED SET PACK', 
    uri: 'https://arweave.net/M3EGrRVqiJpXMn7TiNcNYr2Vz9-6h1Y-2QWHOJwYKCY'
  };
  await metaplex.nfts().update({
    nftOrSft: nft,
    ...jsonData,
  });
  console.log('NFT updated Placeholder successfully');
}

function saveMetadataToDir(nft, _, nftDir) {
  const nft_dir = path.join(process.cwd(), nftDir);
  if (!fs.existsSync(nft_dir)) {
    fs.mkdirSync(nft_dir);
  }

  const toWrite = JSON.stringify({ uri: nft.uri, name: nft.name }, null, 2);
  const filePath = path.join(nft_dir, nft.address.toBase58());
  fs.writeFileSync(filePath, toWrite, 'utf8');
  console.log(`${filePath} wrote:\n${toWrite}\n`);
}

async function handleHashfile(hashFile, hashFunc, ...otherArgs) {
  const jsonData = await getHashListFromFile(hashFile);
  let index = 0;
  console.log(`Handling function ${hashFunc.name}...\n`);
  while (index < jsonData.length) {
    const mintAddress = jsonData[index];
    try {
      const nft = await processHash(mintAddress, ...otherArgs);
      console.log(`${index + 1} of ${jsonData.length}...`);
      await hashFunc(nft, ...otherArgs);
      await sleep(1500);
      index++;
    } catch (error) {
      if (error.name === 'NoInstructionsToSendError') {
        console.log(`NoInstructionsToSendError at ${mintAddress} - moving on...`);
        await sleep(1500);
        index++;
      } else {
        console.log(`${error} ${mintAddress}`);
      }
    }
  }
  console.log('Completed processing all hashes.');
}

export { 
  handleHashfile,
  updateToPlaceholderMetadata,
  updateToImmutableMetadata,
  saveMetadataToDir,
  getHashListFromFile,
  setupMetaplex
};