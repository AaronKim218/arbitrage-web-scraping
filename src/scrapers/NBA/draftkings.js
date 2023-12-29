import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, calculateProbability } from "../../resources/calculations.js";
import { TEAMINDICES, oddsArray} from '../../globals.js';

const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';

export default async function draftkingsScraper(teams) {
    
    puppeteer.use(StealthPlugin());
    
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