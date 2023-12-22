import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { TEAMS } from './globals.js';

let globalDate = '';

export default async function getGames(){
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    
    
    let url = 'https://www.nba.com/games?date=' + currentYear + '-' + currentMonth + '-' + currentDay;
    globalDate = currentMonth + '-' + currentDay + '-' + currentYear;
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.goto(url);
        const gameData = await page.$$eval('div[class*=GameCardMatchup_wrapper]', divs => divs.map(div => div.outerHTML));
        const numGames = gameData.length;
        let data = Array.from(Array(numGames), () => new Array(2));
        for(let i = 0; i < numGames; i++)
        {
            let line = gameData[i];
            
            let j = line.indexOf('MatchupCardTeamName_teamName__') + 30;
            line = line.substring(j, line.length);
           
            
            j = line.indexOf('>') + 1;
            line = line.substring(j, line.length);
            

            j = line.indexOf('<');
            data[i][0] = line.substring(0,j);
            

            j = line.indexOf('MatchupCardTeamName_teamName__') + 30;
            line = line.substring(j, line.length);
           
            
            j = line.indexOf('>') + 1;
            line = line.substring(j, line.length);
            

            j = line.indexOf('<');
            data[i][1] = line.substring(0,j);
        }
        await browser.close();
        return data;
    
        
        

    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }

}