import { isArbitragePossible } from "./resources/calculations.js"
import { TEAMINDICES, oddsArray, SITES} from './globals.js';
import fanduelScraper from "./scrapers/NBA/fanduel.js";
import draftkingsScraper from "./scrapers/NBA/draftkings.js";
import espnbetScraper from "./scrapers/NBA/espnbet.js";
import betriversScraper from "./scrapers/NBA/betrivers.js";
import pinnacleScraper from "./scrapers/NBA/pinnacle.js";

export default async function findArbitrage(games, teams, logger){
    await fanduelScraper(teams);
    await draftkingsScraper(teams);
    await espnbetScraper(teams);
    await betriversScraper(teams);
    await pinnacleScraper(teams);

    tryCombinations(games, oddsArray, logger);
}

function tryCombinations(games, logger) {

    console.log('odds arr', oddsArray)
    for (let game of games) {
        let team1 = game[0];
        let team2 = game[1];

        for (let i = 0; i < SITES.length; i++) {
            for (let j = 0; j < SITES.length; j++) {
                if (i === j) {
                    continue;
                }

                let oddsTeam1Team2 = [oddsArray[i][TEAMINDICES.get(team1)], oddsArray[j][TEAMINDICES.get(team2)]];

                console.log('team 1 team 2', oddsTeam1Team2);

                let arbitragePossibleTeam1Team2 = isArbitragePossible(oddsTeam1Team2);

                console.log(`Arbitrage possible for ${team1} on site ${SITES[i]} vs ${team2} on site ${SITES[j]}: ${arbitragePossibleTeam1Team2}`);
            }
        }
    }
    console.log('tryCombinations() done');
}