import findArbitrage from "./findArbitrage.js";
import logger from "./logger.js";
import getGames from "./getGames.js"



async function main() {
    let todaysTeams = await getGames();
    // console.log('data', data);
    let flattenedData = todaysTeams.reduce((acc, val) => acc.concat(val), []);
    // console.log('flatten', flattenedData);
    // flattenedData = flattenedData.slice(12);
    // console.log('flatten', flattenedData);
    await findArbitrage(todaysTeams, flattenedData, logger);

    
    

}

main();