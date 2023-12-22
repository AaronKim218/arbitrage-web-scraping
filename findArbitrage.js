import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, isArbitragePossible, calculateProbability, calculateBet } from "./src/resources/calculations.js"
import { TEAMINDICES, SITEINDICES, TEAMS, oddsArray, SITES} from './globals.js';

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';


export default async function findArbitrage(games, data, logger){
    // console.log(data);
    await fanduelScraper(data);
    await draftkingsScraper(data);

    // console.log(oddsArray);

    tryCombinations(games, oddsArray, logger);
}

async function fanduelScraper(teams) {
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()
        await page.goto(fanduelNBA, { waitUntil: 'domcontentloaded' })
        for(let i = 0; i < teams.length; i++)
        {
            
            await page.waitForSelector(`div[aria-label*="${teams[i]}"]`);
            const elements = await page.$$(`div[aria-label*="${teams[i]}"]`);
            // console.log('teams[' + i + ']:',elements);
            const elementsHTML = await Promise.all(elements.map(element => element.evaluate(node => node.outerHTML)));
            //line will contain all of the html information, so we need to append it down to only have the odds"
            let line = elementsHTML[1];
            console.log('team',teams[i])
            console.log('line', line)
            
            
            //removes excess html in beginning
            const comma = line.indexOf(',');
            line = line.substring(comma,line.length);
            
            const plus = line.indexOf('+');
            const minus = line.indexOf('-');
            if(plus == -1 | minus == -1)
                line = line.substring(Math.max(plus, minus),line.length);
            else
                line = line.substring(Math.min(plus, minus),line.length);
            
            //removes excess html in the end
            const end = line.indexOf(' ');
            line = line.substring(0, end);
            
            
            //convert string number to integer
            const intValueOfString = parseInt(line);
            // console.log('val', intValueOfString);
            
            //convert odds to decimal value, and then convert decimal value to probability
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            oddsArray[0][TEAMINDICES.get(teams[i])] = probability;
            
            
        }
        await browser.close();
        console.log('Fanduel done');
        
        
    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }
}
async function draftkingsScraper(teams) {
    
    puppeteer.use(StealthPlugin());

    //console.log('teams', teams);
    
    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.goto(draftkingsNBA, { waitUntil: 'domcontentloaded' })
    for(let i = 0; i < teams.length; i++)
    {

        try {
            const elementsHTML = await page.$$eval(`div[aria-label*="${teams[i]}"]`, elements => 
            elements.map(element => {
                // Get the div within that div that has the class "sportsbook-odds"
                const oddsElement = element.querySelector('.sportsbook-odds.american.no-margin.default-color');
                return oddsElement ? oddsElement.outerHTML : null;
            })
        );
            // console.log('teams[' + i + ']:',elementsHTML);

            // const validElementsHTML = elementsHTML.filter(html => html !== null);
            
            //line will contain all of the html information, so we need to append it down to only have the odds"
            let line = elementsHTML[1];
            console.log('team',teams[i])
            console.log('line', line)
            

            //removes excess html in beginning
            let arrow = line.indexOf('>');
            line = line.substring(arrow+1,line.length);

            arrow = line.indexOf('<');
            line = line.substring(0,arrow);


            // console.log('line', line);
            // console.log('sign', line[0])
            
            const negative = line[0] !== '+';

            if (negative) {
                line = line.substring(1);
            }
            
            //convert string number to integer
            const intValueOfString = negative ? parseInt(line) * -1 : parseInt(line);
            // console.log(intValueOfString);
            
            //convert odds to decimal value, and then convert decimal value to probability
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            oddsArray[1][TEAMINDICES.get(teams[i])] = probability;

        } catch(e) {
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
        
        
    }
    await browser.close();
    console.log('Draftkings done');
        
        
}



function tryCombinations(games, logger) {

    console.log('odds arr', oddsArray)
    for (let game of games) {
        let team1 = game[0];
        let team2 = game[1];

        let oddsTeam1Team2 = [oddsArray[0][TEAMINDICES.get(team1)], oddsArray[1][TEAMINDICES.get(team2)]];
        let oddsTeam2Team1 = [oddsArray[0][TEAMINDICES.get(team2)], oddsArray[1][TEAMINDICES.get(team1)]];

        console.log('team 1 team 2', oddsTeam1Team2);
        console.log('team 2 team 1', oddsTeam2Team1);

        let arbitragePossibleTeam1Team2 = isArbitragePossible(oddsTeam1Team2);
        let arbitragePossibleTeam2Team1 = isArbitragePossible(oddsTeam2Team1);

        console.log(`Arbitrage possible for ${team1} on site ${SITES[0]} vs ${team2} on site ${SITES[1]}: ${arbitragePossibleTeam1Team2}`);
        console.log(`Arbitrage possible for ${team2} on site ${SITES[0]} vs ${team1} on site ${SITES[1]}: ${arbitragePossibleTeam2Team1}`);
    }
    console.log('tryCombinations done');
}