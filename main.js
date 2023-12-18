import findArbitrage from "./findArbitrage.js";
import logger from "./logger.js";

async function main() {
    // ask for user input from terminal to get config for scraping
    // TODO
    

    const GAMES = ['Lakers'];
    const SITES = ['FANDUEL'];

    for (const game in GAMES) {
        findArbitrage(SITES, game, logger);
    }

}

main();