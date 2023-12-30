import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { calculateProbability } from "../../resources/calculations.js";
import { TEAMINDICES, oddsArray} from '../../globals.js';

const pinnacleNBA = 'https://www.pinnacle.com/en/basketball/nba/matchups/#period:0'

export default async function pinnacleScraper(teams) {

    puppeteer.use(StealthPlugin());

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()
    await page.goto(pinnacleNBA, { waitUntil: 'networkidle2' })
    for(let i = 0; i < teams.length; i++)
    {
        try{

            const elementsHTML = await page.$$eval(`span`, (spans, teamName) => 
                spans.map(span => {
                    if (span.innerText.includes(teamName)) {
                        // Check the position of the span's parent within its parent
                        let parentElement = span.parentElement;
                        let childIndex = null;
                        if (parentElement && parentElement.parentElement) {
                            let children = Array.from(parentElement.parentElement.children);
                            childIndex = children.indexOf(parentElement);
                        }

                        if (childIndex === null) return null; // Parent's position is not determined

                        // Navigate to the 7th parent
                        let seventhParent = span;
                        for (let i = 0; i < 7; i++) {
                            if (seventhParent.parentElement) {
                                seventhParent = seventhParent.parentElement;
                            } else {
                                // Not enough parents, return null
                                return null;
                            }
                        }

                        // Get the 4th child of the 7th parent
                        let fourthChildOfSeventhParent = seventhParent.children[3];
                        if (!fourthChildOfSeventhParent) return null;

                        // Depending on the initial position (first or second child), select the corresponding child
                        let targetChild = (childIndex === 0) ? fourthChildOfSeventhParent.children[0] : fourthChildOfSeventhParent.children[1];
                        if (!targetChild) return null;

                        // Find the span with the specified class and return its text
                        let priceSpan = targetChild.querySelector('.style_price__3Haa9');
                        return priceSpan ? priceSpan.innerText : null;
                    }
                    return null;
                }).filter(item => item !== null),
                teams[i]
            );
            
            let text = elementsHTML[0];

            // console.log('span text', text);
            
            let probability = parseFloat(calculateProbability(parseFloat(text)));
            // console.log(teams[i], 'pinnacle')
            // console.log('prob', probability)
            oddsArray[4][TEAMINDICES.get(teams[i])] = probability;
            
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