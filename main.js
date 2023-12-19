import findArbitrage from "./findArbitrage.js";
import logger from "./logger.js";
import getGames from "./getGames.js"

let data = Array.from(Array(2), () => new Array(30));

async function main() {
    
    

    // const GAMES = ['Lakers'];
    // const SITES = ['FANDUEL'];

    // for (const game in GAMES) {
    //     findArbitrage(logger);
    // }
    findArbitrage(logger);
    //getGames();

}

main();