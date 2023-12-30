import findArbitrage from "./findArbitrage.js";
import logger from "./utils/logger.js";
import getGames from "./scrapers/NBA/getGames.js"

async function main() {
    try{
        let matchups = await getGames();
        // console.log(matchups);
        
        //just different syntax that does the same thing
        let teams = [].concat(...matchups);
        // console.log('teams', teams);
        
        await findArbitrage(matchups, teams, logger);
        process.exit(0);
    }
    catch(e)
    {
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
            
    }
    

    
    

}

main();