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
        const browser = await puppeteer.launch({ headless: "new" })
        const page = await browser.newPage()
        await page.goto(url, { waitUntil: 'networkidle2' });
        const gameData = await page.$$eval('div[class*=GameCardMatchup_wrapper]', divs =>
            divs.map(div => div.outerHTML));
        const numGames = gameData.length;
        let data = [];
        for(let i = 0; i < numGames; i++)
        {
            let line = gameData[i];
            let temp = [];
            
            let validGameCheck = line.charAt(line.indexOf('data-game-status') + 18);
            if(validGameCheck == '2' || validGameCheck == '3')
                continue;
        
            let j = line.indexOf('MatchupCardTeamName_teamName__') + 30;
            line = line.substring(j, line.length);
           
            
            j = line.indexOf('>') + 1;
            line = line.substring(j, line.length);
            

            j = line.indexOf('<');
            temp.push(line.substring(0,j));
            

            j = line.indexOf('MatchupCardTeamName_teamName__') + 30;
            line = line.substring(j, line.length);
           
            
            j = line.indexOf('>') + 1;
            line = line.substring(j, line.length);
            

            j = line.indexOf('<');
            temp.push(line.substring(0,j));

            data.push(temp);
        }
        await browser.close();
        console.log('getGames() done');
        return data;
    
        
        

    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }

}