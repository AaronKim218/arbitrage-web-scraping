import findArbitrage from "./findArbitrage.js";
import logger from "./logger.js";
import getGames from "./getGames.js"

//let data = Array.from(Array(2), () => new Array(30));

async function main() {
    let data = await getGames();
    // console.log(data);
    let flattenedData = data.reduce((acc, val) => acc.concat(val), []);
    // console.log('flatten', flattenedData);
    // flattenedData = flattenedData.slice(12);
    // console.log('flatten', flattenedData);
    await findArbitrage(flattenedData, logger);

    
    

}

main();