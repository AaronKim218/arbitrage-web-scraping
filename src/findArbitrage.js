import { chromium } from "playwright";
import calculateArbitrage from "./resources/arbitrage.js";

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';

export default async function findArbitrage(sites, game, logger) {

    let data = {};

    // add web scraping data to data object
    for (const site in sites) {
        switch (site) {
            case 'FANDUEL':
                data[site] = await fanduelScraper(game);
                break;
            case 'DRAFTKINGS':
                data[site] = await draftkingsScraper(game);
                break;
            default:
                console.log("Invalid site");
        }
    }

    // do some math with data (call some calculateArbitrage function that should be in resources/arbitrage.js)
    const results = calculateArbitrage(data);

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
    
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(fanduelNBA)

    const divsWithAriaLabel = await page.$$(`div[aria-label*="${team}"]`);
    const games = [];

    for (let i=FANDUEL_MONEYLINE; i<divsWithAriaLabel.length; i+=3) {
        // do shit
    }
}

async function draftkingsScraper(game) {
    await page.goto(draftkingsNBA)
}