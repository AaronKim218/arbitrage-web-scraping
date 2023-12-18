import { chromium } from "playwright";
import { convertOddsToDecimal, isArbitragePossible, calculateProbability, calculateBet } from "./src/resources/FormulaCode.js";

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';

export default async function findArbitrage(sites, game, logger) {

    let data = [];
    await fanduelScraper(game);
    console.log(data);

    // add web scraping data to data object
    // for (const site in sites) {
    //     console.log(site);
    //     switch (site) {
    //         case 'FANDUEL':
    //             data[site] = await fanduelScraper(game);
    //             break;
    //         case 'DRAFTKINGS':
    //             data[site] = await draftkingsScraper(game);
    //             break;
    //         default:
    //             console.log("Invalid site");
    //     }
    // }

    // do some math with data (call some calculateArbitrage function that should be in resources/arbitrage.js)
    // const results = calculateArbitrage(data);

    // log results
    
}


// const { chromium } = require('playwright');
//     (async () => {
//       const browser = await chromium.launch();
//       const page = await browser.newPage();
//       await page.goto('https://yourwebsite.com');
    
//       // Select all divs where aria-label contains a specific string
//       const searchString = 'part_of_aria_label';
//       const divsWithAriaLabel = await page.$$(`div[aria-label*="${searchString}"]`);
    
//       // Iterate over the elements and perform actions
//       for (const div of divsWithAriaLabel) {
//         const textContent = await div.textContent();
//         console.log(textContent);
//       }
    
//       await browser.close();
//     })();
// }

async function fanduelScraper(game) {
    const team = 'Los Angeles Lakers';
    const FANDUEL_MONEYLINE = 1;
    
    const browser = await chromium.launch({headless: false,});
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(fanduelNBA)

    const divsWithAriaLabel = await page.$$(`div[aria-label*="${team}"]`);
    const games = [];

    for (let i=FANDUEL_MONEYLINE; i<divsWithAriaLabel.length; i+=3) {
        //line will be of the form: "Team Name, +/-num Odds"
        const line = divsWithAriaLabel[i];
        
        //first append the string to be "+/-num Odds"
        let j = 0;
        while(line.charAt(i) != '+' | line.charAt(i) != '-' )
            j++;
        line = line.substring(j,line.length());
        //then append the string to be "+/-num"
        j = 0;
        while(line.charAt(i) != ' ')
            j++;
        line = line.substring(0,j);
        //convert string number to integer
        const intValueOfString = parseInt(line);
        
        //convert odds to decimal value, and then convert decimal value to probability
        const probability = calculateProbability(convertOddsToDecimal(intValueOfString));
        data.push(probability);

    }
    await browser.close(); 
}

// async function draftkingsScraper(game) {
//     await page.goto(draftkingsNBA)
// }