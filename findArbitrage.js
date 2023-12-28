import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, isArbitragePossible, calculateProbability, calculateBet } from "./src/resources/calculations.js"
import { TEAMINDICES, SITEINDICES, TEAMS, oddsArray, SITES} from './globals.js';

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';
const espnbetNBA = 'https://espnbet.com/sport/basketball/organization/united-states/competition/nba/featured-page'
const betriversNBA = 'https://nj.betrivers.com/?page=sportsbook&group=1000093652&type=matches'


export default async function findArbitrage(games, teams, logger){
    // console.log(teams);
    await fanduelScraper(teams);
    await draftkingsScraper(teams);
    await espnbetScraper(teams);
    await betriversScraper(teams);

    // console.log(oddsArray);

    tryCombinations(games, oddsArray, logger);
}

async function fanduelScraper(teams) {
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()
        await page.goto(fanduelNBA, { waitUntil: 'networkidle2' })
        for(let i = 0; i < teams.length; i++)
        {
            
            await page.waitForSelector(`div[aria-label*="${teams[i]}"]`);
            const elements = await page.$$(`div[aria-label*="${teams[i]}"]`);
            // console.log('teams[' + i + ']:',elements);
            const elementsHTML = await Promise.all(elements.map(element => element.evaluate(node => node.outerHTML)));
            //line will contain all of the html information, so we need to append it down to only have the odds"
            let line = elementsHTML[1];
            
            // console.log('team',teams[i])
            // console.log('line', line)
            
            
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
        console.log('fanduelScraper() done');
        
        
    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }
}
async function draftkingsScraper(teams) {
    
    puppeteer.use(StealthPlugin());

    // console.log('teams', teams);
    
    

    
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()
        await page.goto(draftkingsNBA, { waitUntil: 'networkidle2' })
        for(let i = 0; i < teams.length; i++)
        {
            try{
            const elementsHTML = await page.$$eval(`div[aria-label*="${teams[i]}"]`, elements => 
            elements.map(element => {
                // Get the div within that div that has the class "sportsbook-odds"
                const oddsElement = element.querySelector('[class*="sportsbook-odds"]');
                return oddsElement ? oddsElement.outerHTML : null;
                }).filter(item => item !== null)
            );
            // console.log('teams[' + i + ']:' + elementsHTML);

            // const validElementsHTML = elementsHTML.filter(html => html !== null);
            
            //line will contain all of the html information, so we need to append it down to only have the odds"
            let line = elementsHTML[1];
            // console.log(teams[i]);
            // console.log('line', line);
            

            //removes excess html in beginning
            let arrow = line.indexOf('>');
            line = line.substring(arrow+1,line.length);

            arrow = line.indexOf('<');
            line = line.substring(0,arrow);


            // console.log('line', line);
            // console.log('sign', line[0])
            
            const negative = line[0] !== '+';

            // remove plus or minus sign
            line = line.substring(1);
            
            //convert string number to integer
            const intValueOfString = negative ? parseInt(line) * -1 : parseInt(line);
            // console.log(intValueOfString);
            
            //convert odds to decimal value, and then convert decimal value to probability
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            oddsArray[1][TEAMINDICES.get(teams[i])] = probability;
            
            }
            catch(e) {
                console.log(e.stack);
                console.log(e.name);
                console.log(e.message);
    
            }

        }
        console.log('draftkingsScraper() done');

}

async function espnbetScraper(teams) {
    
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.goto(espnbetNBA, { waitUntil: 'networkidle2' })
    for(let i = 0; i < teams.length; i++)
    {
        try{
            const elementsHTML = await page.$$eval(`img[alt*="${teams[i]}"]`, elements => 
                elements.map(element => {
                    // Navigate up to the 4th parent
                    let fourthParent = element;
                    for (let j = 0; j < 4; j++) {
                        if (fourthParent.parentElement) {
                            fourthParent = fourthParent.parentElement;
                        } else {
                            // If there aren't enough parent elements, return null
                            return null;
                        }
                    }

                    // Get the second child of the 4th parent
                    const secondChild = fourthParent.children[1];
                    if (!secondChild) {
                        return null;
                    }

                    // Get the third button within the second child
                    const buttons = secondChild.querySelectorAll('button');
                    if (buttons && buttons.length >= 3) {
                        // Get the second span within the third button
                        const spans = buttons[2].querySelectorAll('span');
                        if (spans && spans.length >= 2) {
                            return spans[1].outerHTML;
                        }
                    }

                    return null;
                }).filter(item => item !== null)
            );
            console.log(teams[i], elementsHTML);
            
            let line = elementsHTML[0];
            
            //removes excess html in beginning
            line = line.substring(1, line.length - 1);

            let arrow = line.indexOf('>');
            line = line.substring(arrow+1,line.length);
            arrow = line.indexOf('<');
            line = line.substring(0,arrow);

            if (line === 'Even') {
                line = '+100';
            }

            console.log(`${teams[i]}`, line);
            
            // boolean that represents negative or not
            const negative = line[0] !== '+';

            // remove plus or minus sign
            line = line.substring(1);
            
            const intValueOfString = negative ? parseInt(line) * -1 : parseInt(line);
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            console.log('prob', probability)
            oddsArray[2][TEAMINDICES.get(teams[i])] = probability;
            
        }
        catch(e) {
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);

        }
    }

    console.log('odds arr', oddsArray)
    console.log('espnbetScraper() done');

}

async function betriversScraper(teams) {
    
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.goto(betriversNBA, { waitUntil: 'networkidle2' })
    for(let i = 0; i < teams.length; i++)
    {
        try{
            const elementsHTML = await page.$$eval(`button[aria-label*="Moneyline"]`, (buttons, teamName) => 
                buttons.map(button => {
                    if (button.getAttribute('aria-label').includes(teamName)) {
                        return button.getAttribute('aria-label');
                    }
                    return null;
                }).filter(item => item !== null),
                teams[i]
            );
            
            let ariaLabel = elementsHTML[0];

            console.log('aria label', ariaLabel);
        

            let start = ariaLabel.indexOf('at ') + 3;
            ariaLabel = ariaLabel.substring(start, ariaLabel.length);

            // boolean that represents negative or not
            const negative = ariaLabel[0] !== '+';

            // remove plus or minus sign
            ariaLabel = ariaLabel.substring(1);
            
            const intValueOfString = negative ? parseInt(ariaLabel) * -1 : parseInt(ariaLabel);
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            console.log(teams[i], 'betrivers')
            console.log('prob', probability)
            oddsArray[3][TEAMINDICES.get(teams[i])] = probability;
            
        }
        catch(e) {
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);

        }
    }

    console.log('odds arr', oddsArray)
    console.log('betriversScraper() done');

}

function tryCombinations(games, logger) {

    console.log('odds arr', oddsArray)
    for (let game of games) {
        let team1 = game[0];
        let team2 = game[1];

        // let oddsTeam1Team2 = [oddsArray[0][TEAMINDICES.get(team1)], oddsArray[1][TEAMINDICES.get(team2)]];
        // let oddsTeam2Team1 = [oddsArray[0][TEAMINDICES.get(team2)], oddsArray[1][TEAMINDICES.get(team1)]];

        // console.log('team 1 team 2', oddsTeam1Team2);
        // console.log('team 2 team 1', oddsTeam2Team1);

        // let arbitragePossibleTeam1Team2 = isArbitragePossible(oddsTeam1Team2);
        // let arbitragePossibleTeam2Team1 = isArbitragePossible(oddsTeam2Team1);

        // console.log(`Arbitrage possible for ${team1} on site ${SITES[0]} vs ${team2} on site ${SITES[1]}: ${arbitragePossibleTeam1Team2}`);
        // console.log(`Arbitrage possible for ${team2} on site ${SITES[0]} vs ${team1} on site ${SITES[1]}: ${arbitragePossibleTeam2Team1}`);

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