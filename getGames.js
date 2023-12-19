import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth'


let date = '';
let games = [];

//date in format daymonthyear (no spaces, full 4 digits of year and include any leading zeros for single digit days/months)
async function getGames(date){
    const date = new Date();
    const currentDay = date.getDate();
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    // const day = date.substring(0,2);
    // const month = date.substring(3,5);
    // const year = date.substring(6, 10);
    let url = '';
    if(date = null)
        url = 'https://www.nba.com/games?date=' + currentYear + '-' + currentMonth + '-' + currentDay;
    else
        url = 'https://www.nba.com/games?date=' + year + '-' + month + '-' + day;
    
    puppeteer.use(StealthPlugin());
    
    try{
        const browser = await puppeteer.launch({ headless: false })
        const page = await browser.newPage()
        await page.goto(url)

        

    } catch(e){
        console.log(e.stack);
        console.log(e.name);
        console.log(e.message);
    }

}