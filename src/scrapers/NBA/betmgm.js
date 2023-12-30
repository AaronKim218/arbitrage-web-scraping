import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { convertOddsToDecimal, calculateProbability } from "../../resources/calculations.js";
import { TEAMINDICES, oddsArray} from '../../globals.js';

const betmgmNBA = 'https://sports.pa.betmgm.com/en/sports/basketball-7/betting/usa-9/nba-6004';

export default async function betmgmScraper(teams) {
    
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(betmgmNBA, { waitUntil: 'networkidle2' });

    for(let i = 0; i < teams.length; i++) {
        try {
            let team = teams[i].toLowerCase();
            const href = await page.$$eval(`a[href*="${team}"]`, elements => 
                elements.map(element => element.getAttribute('href'))
            );

            const matchup = href[0];
            const divider = matchup.indexOf('at');
            
            const childElementsHTML = await page.$$eval(`a[href*="${team}"]`, elements => 
                elements.flatMap(element => Array.from(element.parentElement.children).map(child => child.outerHTML))
            );
            childElementsHTML.shift();
            const separatedElementsHTML = childElementsHTML.flatMap(html => html.split('</div>').filter(str => str.trim() !== '').map(str => str + '</div>'));
            const filteredElementsHTML = separatedElementsHTML.filter(html => /[-+]\d{3,}/.test(html));
            let odds = '';
            if(matchup.indexOf(team) < divider)
                odds = filteredElementsHTML[filteredElementsHTML.length-2];
            else
                odds = filteredElementsHTML[filteredElementsHTML.length-1];    

            const start = odds.indexOf(';">') + 3;
            const end = odds.indexOf('!');
            odds = odds.substring(start, end);
            const intValueOfString = parseInt(odds);
            
            // convert odds to decimal value, and then convert decimal value to probability
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            oddsArray[5][TEAMINDICES.get(teams[i])] = probability;
        }
        catch(e) {
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);
        }
    }

    await browser.close();
    console.log('betmgmScraper() done');
}