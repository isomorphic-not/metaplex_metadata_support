const axios = require('axios');
const fs = require('fs');
const path = require('path');
const tokemonMap = require("../constants");

jest.setTimeout(100000);

describe('Fetch data from URIs in test data', () => {
    const nft_dir_path = path.join(__dirname, './../../nfts');
    let results = [];
    let index = 0;

    const tokemonDirs = fs.readdirSync(nft_dir_path);
    console.log(`Tokemon directories found: ${tokemonDirs}`);

    tokemonDirs.forEach((tokemonDir) => {
        const tokeDir = path.join(nft_dir_path, tokemonDir);
        const tokemonFiles = fs.readdirSync(tokeDir);

        tokemonFiles.forEach((tokemonHashFile) => {
            test(`Fetching data from ${tokemonDir}`, async () => {
                const filePath = path.join(tokeDir, tokemonHashFile);
                
                let fileData;

                fileData = fs.readFileSync(filePath, 'utf8');
                const { uri, name } = JSON.parse(fileData);
                
                console.log(`Testing ${name} URI ${index}: requesting ${uri} in file: ${tokemonHashFile}`);
                let response;
                while (true) { 
                    try {
                        response = await axios.get(uri, { timeout: 5000 });
                        break;
                    } catch (error) {
                        console.log(`Retrying get request on file ${filePath} at ${uri}`);
                    }
                }

                const responseData = response.data;
                expect(responseData).toHaveProperty('name', name);

                const TokemonClass = tokemonMap.tokemonMap[name];
                const tokemonInstance = new TokemonClass();

                expect(responseData).toHaveProperty('description', tokemonInstance.description);

                const stage = responseData.attributes.find(attr => attr.trait_type === "stage")?.value;
                expect(stage).toBe(tokemonInstance.stage);

                const hp = responseData.attributes.find(attr => attr.trait_type === "hp")?.value;
                expect(hp).toBe(tokemonInstance.hp);

                const background = responseData.attributes.find(attr => attr.trait_type === "background")?.value;
                expect(background).toBe(tokemonInstance.background);

                const attack = responseData.attributes.find(attr => attr.trait_type === "attack")?.value;
                expect(attack).toBe(tokemonInstance.attack);

                const type = responseData.attributes.find(attr => attr.trait_type === "type")?.value;
                expect(type).toBe(tokemonInstance.type);

                results.push(responseData);
                index++;
            });
        });
    });

    afterAll(() => {
        const sorted_results = results.sort((a, b) => {
            const numberA = a.attributes.find(attr => attr.trait_type === 'number')?.value || 0;
            const numberB = b.attributes.find(attr => attr.trait_type === 'number')?.value || 0;
            return parseInt(numberA) - parseInt(numberB);
        });
    
        Object.keys(tokemonMap.tokemonMap).forEach((key) => {
            const TokemonClass = tokemonMap.tokemonMap[key];
            const tokemonInstance = new TokemonClass(); 
            const tokemonList = sorted_results.filter(item => item.name === tokemonInstance.name);

            expect(tokemonList.length).toBe(tokemonInstance.totalCards);
            for (let i = 0; i <= tokemonList.length; i++) {
                const tokemonNumber = tokemonList[i].attributes.find(attr => attr.trait_type === "number")?.value;
                expect(tokemonNumber).toBe(i+1);
            };
        });
    
        console.log("Tests complete!");
    });
});
