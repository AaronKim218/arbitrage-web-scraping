import { isArbitragePossible } from "./resources/calculations.js"
import { TEAMINDICES, oddsArray, SITES} from './globals.js';
import { globalDate } from './scrapers/NBA/getGames.js';
import fanduelScraper from "./scrapers/NBA/fanduel.js";
import draftkingsScraper from "./scrapers/NBA/draftkings.js";
import espnbetScraper from "./scrapers/NBA/espnbet.js";
import betriversScraper from "./scrapers/NBA/betrivers.js";
import pinnacleScraper from "./scrapers/NBA/pinnacle.js";
import betmgmScraper from "./scrapers/NBA/betmgm.js";
import emailCombinations from "./utils/email.js";

export default async function findArbitrage(games, teams, logger){
    await fanduelScraper(teams);
    await draftkingsScraper(teams);
    await espnbetScraper(teams);
    await betriversScraper(teams);
    await pinnacleScraper(teams);
    await betmgmScraper(teams);

    const {arbitrageFound, result } = tryCombinations(games, oddsArray, logger);
    const email = process.argv[2];
    if (arbitrageFound && email) {
        try {
            let response = await emailCombinations(email, result);
            console.log('Successfully sent email:', response);
        } catch (error) {
            console.error('Failed to send email:', error);
        }
    }
}

function tryCombinations(games, logger) {

    // console.log('odds arr', oddsArray)
    let arbitrageFound = false;
    let result = '';
    console.log();
    // console.log(`Combinations for ${globalDate}:\n`);
    result += `Combinations for ${globalDate}:\n\n`;
    for (let game of games) {
        let team1 = game[0];
        let team2 = game[1];
        // console.log(team1 + ' vs ' + team2 + ':');
        result += team1 + ' vs ' + team2 + ':\n';
        
        for (let i = 0; i < SITES.length; i++) {
            for (let j = 0; j < SITES.length; j++) {
                if (i === j) {
                    continue;
                }
                //for testing without betrivers/pinnacle
                // if(i == 3 || j == 3 || i == 4 || j == 4)
                //     continue;
                    
                    
                let oddsTeam1Team2 = [oddsArray[i][TEAMINDICES.get(team1)], oddsArray[j][TEAMINDICES.get(team2)]];
                let arbitragePossibleTeam1Team2 = isArbitragePossible(oddsTeam1Team2);
                //only prints out the working combinations rather than all
                if(arbitragePossibleTeam1Team2) {
                    // console.log(`${team1}: ${SITES[i]} & ${team2}: ${SITES[j]}`);
                    result += `${team1}: ${SITES[i]} & ${team2}: ${SITES[j]}\n`;
                    arbitrageFound = true;
                }                
            }
        }
        // console.log();
        result += '\n';
    }
    // console.log('tryCombinations() done');
    console.log(result);
    return { arbitrageFound, result }
}
