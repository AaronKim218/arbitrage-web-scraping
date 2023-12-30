import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, calculateProbability } from "../../resources/calculations.js";
import { TEAMINDICES, oddsArray} from '../../globals.js';

const espnbetNBA = 'https://espnbet.com/sport/basketball/organization/united-states/competition/nba/featured-page'

export default async function espnbetScraper(teams) {
    
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
            // console.log(teams[i], elementsHTML);
            
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

            // console.log(`${teams[i]}`, line);
            
            // boolean that represents negative or not
            const negative = line[0] !== '+';

            // remove plus or minus sign
            line = line.substring(1);
            
            const intValueOfString = negative ? parseInt(line) * -1 : parseInt(line);
            let probability = parseFloat(calculateProbability(convertOddsToDecimal(intValueOfString)));
            // console.log('prob', probability)
            oddsArray[2][TEAMINDICES.get(teams[i])] = probability;
            
        }
        catch(e) {
            console.log(e.stack);
            console.log(e.name);
            console.log(e.message);

        }
    }

    // console.log('odds arr', oddsArray)
    console.log('espnbetScraper() done');

}