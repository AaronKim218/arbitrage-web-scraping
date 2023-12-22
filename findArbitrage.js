import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, isArbitragePossible, calculateProbability, calculateBet } from "./src/resources/calculations.js"
import { TEAMINDICES, SITEINDICES, TEAMS } from './globals.js';

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';

let temp = [];

export default async function findArbitrage(data, logger){
    await fanduelScraper(data);
   //await draftkingsScraper(data);

    // console.log(temp);

    //tryCombinations(sites, games, data, logger);
    //error is currently that i need to figure out where in the html array the team will be (i think) and change that per team
}

async function fanduelScraper(teams) {
    
    puppeteer.use(StealthPlugin());
    
    try{
        for(const team in teams)
        {
            console.log(team);
            const browser = await puppeteer.launch({ headless: true })
            const page = await browser.newPage()
            await page.goto(fanduelNBA)
            const elements = await page.$$(`div[aria-label*="${team}"]`);
            const elementsHTML = await Promise.all(elements.map(element => element.evaluate(node => node.outerHTML)));
            
            //line will contain all of the html information, so we need to append it down to only have the odds"
            let line = elementsHTML[1];
            
            
            // //removes excess html in beginning
            // const comma = line.indexOf(',');
            // line = line.substring(comma,line.length);
            
            // const plus = line.indexOf('+');
            // const minus = line.indexOf('-');
            // if(plus == -1 | minus == -1)
            //     line = line.substring(Math.max(plus, minus),line.length);
            // else
            //     line = line.substring(Math.min(plus, minus),line.length);
            
            // //removes excess html in the end
            // const end = line.indexOf(' ');
            // line = line.substring(0, end);
            
            
            // //convert string number to integer
            // const intValueOfString = parseInt(line);
            // // console.log(intValueOfString);
            
            // //convert odds to decimal value, and then convert decimal value to probability
            // let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            
            // temp.push(probability);
            await browser.close();
            
            
        }
        
        
        
    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }
}
async function draftkingsScraper(teams) {
    
    puppeteer.use(StealthPlugin());
    
    try{
        for(const team in teams)
        {
            console.log(team);
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
            

            // //removes excess html in beginning
            // let arrow = line.indexOf('>');
            // line = line.substring(arrow+1,line.length);

            // arrow = line.indexOf('<');
            // line = line.substring(0,arrow);
            
            
            
            // //convert string number to integer
            // const intValueOfString = parseInt(line);
            // // console.log(intValueOfString);
            
            // //convert odds to decimal value, and then convert decimal value to probability
            // let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            // temp.push(probability);
            
            await browser.close();
        }
        
    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }
}



// function tryCombinations(SITEINDICES, games, data, logger) {
//     for (const game in games) {

//         // depends on how we store games
//         const team1 = game[0]
//         const team2 = game[1]

//         // somehow get indices of team1 and team2 in data
//         const team1Index = TEAMINDICES[team1]
//         const team2Index = TEAMINDICES[team2]

//         // these two loops try all combinations of sites
//         for (let i=0; i<SITEINDICES.length; i++) {
//             for (let j=i+1; j<SITEINDICES.length; j++) {
//                 if (isArbitragePossible(data[i][team1Index], data[j][team2])) {
//                     logger.info(`Arbitrage possible for ${team1} and ${team2} between ${i} and ${j}`)
//                 } else {
//                     console.log(`Arbitrage not possible for ${team1} and ${team2} between ${i} and ${j}`)
//                 }
//             }
//         }

//         for (let i=0; i<SITEINDICES.length; i++) {
//             for (let j=i+1; j<SITEINDICES.length; j++) {
//                 if (isArbitragePossible(data[i][team2Index], data[j][team1Index])) {
//                     logger.info(`Arbitrage possible for ${team1} and ${team2} between ${i} and ${j}`)
//                 } else {
//                     console.log(`Arbitrage not possible for ${team1} and ${team2} between ${i} and ${j}`)
//                 }
//             }
//         }
//     }
// }