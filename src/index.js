// Import the default export from the CommonJS module
import runJs from "../src/run_js.cjs";

const { getMetadataFromHashfile, updateNftMetadata } = runJs;
import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  rl.question(
    "Enter '1' to process hashes, '2' to update metadata, or 'exit' to quit: ",
    async (answer) => {
      try {
        if (answer === "1") {
          console.log("Starting NFT processing...");
          await getMetadataFromHashfile("hash_list.txt");
          console.log("NFT processing completed.");
          rl.close();
        } else if (answer === "2") {
          console.log(`Updating metadata for mint address...`);
          await updateNftMetadata();
          console.log("Metadata update completed.");
          rl.close();
        } else if (answer.toLowerCase() === "exit") {
          console.log("Exiting the application.");
          rl.close();
        } else {
          console.log("Invalid input. Please enter '1', '2', or 'exit'.");
          main();
        }
      } catch (error) {
        console.error("An error occurred:", error);
        main();
      }
    },
  );
}

main();
