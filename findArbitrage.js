import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, isArbitragePossible, calculateProbability, calculateBet } from "./src/resources/calculations.js"
import { TEAMINDICES, SITEINDICES } from './globals.js';

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';



async function fanduelScraper() {
    const team = 'Spurs';
    const FANDUEL_MONEYLINE = 1;
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        await page.goto(fanduelNBA)
        const elements = await page.$$(`div[aria-label*="${team}"]`);
        const elementsHTML = await Promise.all(elements.map(element => element.evaluate(node => node.outerHTML)));
        
        //line will contain all of the html information, so we need to append it down to only have the odds"
        let line = elementsHTML[FANDUEL_MONEYLINE];
        
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
        // console.log(intValueOfString);
        
        //convert odds to decimal value, and then convert decimal value to probability
        let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
        data.push(probability);
        
        await browser.close()
    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }
}
async function draftkingsScraper() {
    const team = 'Spurs';
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.goto(draftkingsNBA)
        
        const elementsHTML = await page.$$eval(`div[aria-label*="${team}"]`, elements => 
            elements.map(element => {
                // Get the div within that div that has the class "sportsbook-odds"
                const oddsElement = element.querySelector('.sportsbook-odds');
                return oddsElement ? oddsElement.outerHTML : null;
            })
        );
        //const validElementsHTML = elementsHTML.filter(html => html !== null);
        
        //line will contain all of the html information, so we need to append it down to only have the odds"
        let line = elementsHTML[1];
        

        //removes excess html in beginning
        let arrow = line.indexOf('>');
        line = line.substring(arrow+1,line.length);

        arrow = line.indexOf('<');
        line = line.substring(0,arrow);
        console.log(line);
        
        
        
        //convert string number to integer
        const intValueOfString = parseInt(line);
        // console.log(intValueOfString);
        
        //convert odds to decimal value, and then convert decimal value to probability
        let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
        data.push(probability);
        
        await browser.close()
    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }
}

export default async function findArbitrage(logger){
    await fanduelScraper();
    await draftkingsScraper();

    console.log(data);

    tryCombinations(sites, games, data, logger);

    return data;
}

function tryCombinations(SITEINDICES, games, data, logger) {
    for (const game in games) {

        // depends on how we store games
        const team1 = game[0]
        const team2 = game[1]

        // somehow get indices of team1 and team2 in data
        const team1Index = TEAMINDICES[team1]
        const team2Index = TEAMINDICES[team2]

        // these two loops try all combinations of sites
        for (let i=0; i<SITEINDICES.length; i++) {
            for (let j=i+1; j<SITEINDICES.length; j++) {
                if (isArbitragePossible(data[i][team1Index], data[j][team2])) {
                    logger.info(`Arbitrage possible for ${team1} and ${team2} between ${i} and ${j}`)
                } else {
                    console.log(`Arbitrage not possible for ${team1} and ${team2} between ${i} and ${j}`)
                }
            }
        }

        for (let i=0; i<SITEINDICES.length; i++) {
            for (let j=i+1; j<SITEINDICES.length; j++) {
                if (isArbitragePossible(data[i][team2Index], data[j][team1Index])) {
                    logger.info(`Arbitrage possible for ${team1} and ${team2} between ${i} and ${j}`)
                } else {
                    console.log(`Arbitrage not possible for ${team1} and ${team2} between ${i} and ${j}`)
                }
            }
        }
    }
}