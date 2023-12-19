import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { TEAMS } from './globals.js';

let globalDate = '';


//date in format daymonthyear (no spaces, full 4 digits of year and include any leading zeros for single digit days/months)
export default async function getGames(date = -1){
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    
    date = date.toString();
    let year = date.substring(4,date.length);
    let month = date.substring(2,4);
    let day = date.substring(0,2);
    let url = '';
    if(date == -1)
    {
        url = 'https://www.nba.com/games?date=' + currentYear + '-' + currentMonth + '-' + currentDay;
        globalDate = currentMonth + '-' + currentDay + '-' + currentYear;
    }
        
    else
    {
        url = 'https://www.nba.com/games?date=' + year + '-' + month + '-' + day;
        globalDate = month + '-' + day + '-' + year;
    }
        
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: false })
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
            console.log(data[i][0]);

            j = line.indexOf('MatchupCardTeamName_teamName__') + 30;
            line = line.substring(j, line.length);
           
            
            j = line.indexOf('>') + 1;
            line = line.substring(j, line.length);
            

            j = line.indexOf('<');
            data[i][1] = line.substring(0,j);
        }
        console.log(data);
    
        
        await browser.close();

    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }

}