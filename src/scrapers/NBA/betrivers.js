import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, calculateProbability } from "../../resources/calculations.js";
import { TEAMINDICES, oddsArray} from '../../globals.js';

const betriversPA = 'https://pa.betrivers.com/?page=sportsbook&l=RiversPittsburgh&group=1000093652&type=matches'
const betriversNJ = 'https://nj.betrivers.com/?page=sportsbook&group=1000093652&type=matches'


export default async function betriversScraper(teams) {
    
    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.goto(betriversNJ, { waitUntil: 'networkidle2' })
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

            // console.log('aria label', ariaLabel);
        

            let start = ariaLabel.indexOf('at ') + 3;
            ariaLabel = ariaLabel.substring(start, ariaLabel.length);

            // boolean that represents negative or not
            const negative = ariaLabel[0] !== '+';

            // remove plus or minus sign
            ariaLabel = ariaLabel.substring(1);
            
            const intValueOfString = negative ? parseInt(ariaLabel) * -1 : parseInt(ariaLabel);
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            // console.log(teams[i], 'betrivers')
            // console.log('prob', probability)
            oddsArray[3][TEAMINDICES.get(teams[i])] = probability;
            
        }
        catch(e) {
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);

        }
    }

    // console.log('odds arr', oddsArray)
    console.log('betriversScraper() done');

}