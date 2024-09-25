import { Connection, Keypair, clusterApiUrl, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

dotenv.config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setupMetaplex() {
  const connection = new Connection(
    clusterApiUrl(process.env.RPC_ENDPOINT),
    "confirmed",
    { timeout: 60000 }
  );

  const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
  const wallet = Keypair.fromSecretKey(secretKey);
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  return { connection, wallet, metaplex };
}

async function processHash(metaplex, mintAddress) {
  const mintAddressObj = new PublicKey(mintAddress);
  const nft = await metaplex.nfts().findByMint({ mintAddress: mintAddressObj });
  return nft;
}

async function getHashListFromFile(hashFile) {
  if (!fs.existsSync(hashFile)) {
    throw new Error(`${hashFile} does not exist.`);
  }

  const data = fs.readFileSync(hashFile, "utf8");
  const jsonData = JSON.parse(data);

  if (!Array.isArray(jsonData)) {
    throw new Error(`Expected list of hashes from ${hashFile} but got ${jsonData}`);
  }
  return jsonData;
}

async function updateImmutableNftMetadata(metaplex, nft, mintAddress) {
  const nft_dir = path.join(process.cwd(), "nfts");
  if (!fs.existsSync(nft_dir)) {
    throw new Error(`Directory path ${nft_dir} containing hash files is required.`);
  }
  const filePath = path.join(nft_dir, mintAddress);
  const fileContents = fs.readFileSync(filePath, 'utf8');

  let jsonData
  try {
    jsonData = JSON.parse(fileContents);
  } catch (error) {
    throw new Error(`Error parsing JSON from file ${filePath}: ${error.message}`);
  }

  const updatedNft = await metaplex.nfts().update({
    nftOrSft: nft,
    ...jsonData,
  });
  console.log("NFT updated successfully:", updatedNft);
}

function saveMetadataToDir(nft, mintAddress) {
  const nft_dir = path.join(process.cwd(), "nfts");
  if (!fs.existsSync(nft_dir)) {
    fs.mkdirSync(nft_dir);
  }

  const toWrite = JSON.stringify({ uri: nft.uri, name: nft.name }, null, 2);
  const filePath = path.join(nft_dir, mintAddress);
  fs.writeFileSync(filePath, toWrite, "utf8");
  console.log(`${filePath} wrote:\n${toWrite}\n`);
}

async function handleHashfile(metaplex, hashFile, hashFunc) {
  const jsonData = await getHashListFromFile(hashFile);
  let index = 0;
  console.log(`Handling ${hashFunc.name}\n`);
  while (index < jsonData.length) {
    const mintAddress = jsonData[index];
    try {
      const nft = await processHash(metaplex, mintAddress);
      console.log(`${index} of ${jsonData.length}...`);
      await hashFunc(nft, mintAddress);
      await sleep(1500);
      index++;
    } catch (error) {
      console.log(`${error} ${mintAddress}`);
    }
  }
  console.log("Completed processing all hashes.");
}

export { 
  handleHashfile,
  updateImmutableNftMetadata,
  saveMetadataToDir,
  getHashListFromFile,
  setupMetaplex
};