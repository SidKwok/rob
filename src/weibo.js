const puppeteer = require('puppeteer');
async function getCookie () {
    const browser = await puppeteer.launch({headless: false});
    const weibo = await browser.newPage();
    await weibo.goto('https://weibo.com/');
    // type your username and psw during the login time
    // I know it's little bit dumb, but it works
    await weibo.waitFor(20000);
    const cookies = await weibo.cookies();
    await weibo.waitForNavigation({waitUntil: 'networkidle0'});
    await weibo.screenshot({path: '../output/weibo.jpg', fullPage: true});
    await browser.close();

    return cookies;
}

module.exports = {
    getCookie,
    cookies: ['Your weibo cookie, should be an ObjectArray']
};
