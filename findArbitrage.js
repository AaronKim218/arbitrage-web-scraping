import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { convertOddsToDecimal, isArbitragePossible, calculateProbability, calculateBet } from "./FormulaCode.js"

const fanduelNBA = 'https://sportsbook.fanduel.com/basketball?tab=nba';
const draftkingsNBA = 'https://sportsbook.draftkings.com/leagues/basketball/nba';
let data = [];

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
    const DRAFTKINGS_MONEY = 1;
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        await page.goto(draftkingsNBA)
        const elements = await page.$$(`div[aria-label*="${team}"]`);
        const elementsHTML = await Promise.all(elements.map(element => element.evaluate(node => node.outerHTML)));
        
        //line will contain all of the html information, so we need to append it down to only have the odds"
        let line = elementsHTML[DRAFTKINGS_MONEY];
        
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

export default async function findArbitrage(){
    await fanduelScraper();
    await draftkingsScraper();
    console.log(data);
    return data;
}