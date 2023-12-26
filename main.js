import findArbitrage from "./findArbitrage.js";
import logger from "./logger.js";
import getGames from "./getGames.js"



async function main() {
    let todaysTeams = await getGames();
    // console.log(todaysTeams);
    
    //just different syntax that does the same thing
    let flattenedData = [].concat(...todaysTeams);
    // console.log('flatten', flattenedData);
    
    await findArbitrage(todaysTeams, flattenedData, logger);

    
    

}

main();