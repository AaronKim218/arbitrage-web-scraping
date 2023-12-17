import findArbitrage from "./src/findArbitrage.js";
import logger from "./logger.js";

async function main() {
    // ask for user input from terminal to get config for scraping
    // TODO

    const GAMES = ['Lakers'];
    const SITES = ['FANDUEL', 'DRAFTKINGS'];

    logger.info("Starting main.js");
    logger.error("testing error logs");
    logger.warn("testing warn logs");
    logger.info("testing info logs");
    

    for (const game in GAMES) {
        findArbitrage(SITES, game, logger);
    }

}

main();