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

const connection = new Connection(
  clusterApiUrl(process.env.RPC_ENDPOINT),
  "confirmed",
  {
    timeout: 60000,
  },
);

const secretKey = Uint8Array.from(JSON.parse(process.env.PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(secretKey);
const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

async function updateNftMetadata() {
  try {
    metadataFile = process.env.HASH_FILE;
    const newMetadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
    const mintHash = path.basename(metadataFile, ".json");
    const mintAddress = new PublicKey(mintHash);

    const nft = await metaplex.nfts().findByMint({ mintAddress });
    const updatedNft = await metaplex.nfts().update({
      nftOrSft: nft,
      ...newMetadata,
    });

    console.log("NFT updated successfully:", updatedNft);
  } catch (error) {
    console.error("Error updating NFT metadata:", error);
  }
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function processHash(mintAddress) {
    const mintAddressObj = new PublicKey(mintAddress);
    const nft = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddressObj });
    return nft;
}

async function getHashes() {
  try {
    const data = fs.readFileSync(process.env.HASH_FILE, "utf8");
    const jsonData = JSON.parse(data);
    const nft_dir = path.join(__dirname, "../nfts");

    if (!fs.existsSync(nft_dir)) {
      fs.mkdirSync(nft_dir, { recursive: true });
    }

    if (Array.isArray(jsonData)) {
      index = 0;
      while (true) {
        if (index >= jsonData.length) {
          return
        }
        mintAddress = jsonData[index]
        try {
          nft = await processHash(mintAddress);
          metadataResult = {
            uri: nft.uri,
            name: nft.name,
          };
          const tokemonPath = path.join(nft_dir, metadataResult.name);
          if (!fs.existsSync(tokemonPath)) {
            fs.mkdirSync(tokemonPath, { recursive: true });
          }
  
          const filePath = path.join(tokemonPath, `${mintAddress}`);
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
    } else {
      console.log("JSON data is not an array.");
    }
    console.log("completed");
  } catch (error) {
    console.error(`Error reading or parsing file: ${error}`);
  }
}

module.exports = { getHashes, updateNftMetadata };
