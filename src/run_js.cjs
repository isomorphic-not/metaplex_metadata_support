const {
  Connection,
  Keypair,
  clusterApiUrl,
  PublicKey,
} = require("@solana/web3.js");
const { Metaplex, keypairIdentity } = require("@metaplex-foundation/js");
const fs = require("fs");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function setupMetaplex() {
  const connection = new Connection(
    clusterApiUrl(process.env.RPC_ENDPOINT),
    "confirmed",
    {
      timeout: 60000,
    }
  );

  const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
  const wallet = Keypair.fromSecretKey(secretKey);
  const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

  return { connection, wallet, metaplex };
}

async function processHash(metaplex, mintAddress) {
  const mintAddressObj = new PublicKey(mintAddress);
  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: mintAddressObj });
  return nft;
}

async function updateNftMetadata(metaplex, hashFile) {
    if (!fs.existsSync(hashFile)) {
      return new Error(`${hashFile} does not exist.`);
    }

    const data = fs.readFileSync(hashFile, "utf8");
    const jsonData = JSON.parse(data);

    if (!Array.isArray(jsonData)) {
      return new Error(`Expected list of hashes from ${hashFile} but got ${jsonData}`);
    }

    const newMetadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
    const mintAddress = path.basename(metadataFile, ".json");
    nft = await processHash(mintAddress);

    const updatedNft = await metaplex.nfts().update({
      nftOrSft: nft,
      ...newMetadata,
    });
    console.log("NFT updated successfully:", updatedNft);
}

async function getMetadataFromHashfile(metaplex, hashFile) {
  if (!fs.existsSync(hashFile)) {
    return new Error(`${hashFile} does not exist.`);
  }

  const data = fs.readFileSync(hashFile, "utf8");
  const jsonData = JSON.parse(data);

  if (!Array.isArray(jsonData)) {
    return new Error(`Expected list of hashes from ${hashFile} but got ${jsonData}`);
  }

  const nft_dir = path.join(__dirname, "../nfts");

  if (!fs.existsSync(nft_dir)) {
    fs.mkdir(nft_dir);
  }

  index = 0;
  while (index < jsonData.length) {
    mintAddress = jsonData[index]
    try {
      nft = await processHash(metaplex, mintAddress);
      metadataResult = {
        uri: nft.uri,
        name: nft.name,
      };

      const filePath = path.join(nft_dir, `${mintAddress}`);
      toWrite = JSON.stringify(metadataResult, null, 2)
      fs.writeFileSync(filePath, toWrite, "utf8");
      console.log(`${index}: ${filePath} wrote:\n${toWrite}\n`);
      index++;
    }
    catch(error) {
      console.log(`${error} ${mintAddress}`);
    }
    await sleep(1500);
  }
  console.log("completed");
}

module.exports = { 
  getMetadataFromHashfile: (hashFile) => {
    const { metaplex } = setupMetaplex();
    return getMetadataFromHashfile(metaplex, hashFile);
  },
  
  updateNftMetadata: (hashFile, metadataFile) => {
    const { metaplex } = setupMetaplex();
    return updateNftMetadata(metaplex, hashFile, metadataFile);
  }
};