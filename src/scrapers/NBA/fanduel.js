import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, calculateProbability } from "../../resources/calculations.js";
import { TEAMINDICES, oddsArray} from '../../globals.js';

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';

export default async function fanduelScraper(teams) {
    
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