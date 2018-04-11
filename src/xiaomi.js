const puppeteer = require('puppeteer');
async function getCookie() {
    const browser = await puppeteer.launch({headless: false});
    const xiaomi = await browser.newPage();
    await xiaomi.goto('https://account.xiaomi.com/pass/serviceLogin');
    await xiaomi.type('#username', '17600209147');
    await xiaomi.type('#pwd', 'gxl85245077');
    await xiaomi.click('#login-button');
    await xiaomi.waitForNavigation({waitUntil: 'networkidle0'});
    // await xiaomi.waitFor(600000);
    const cookies = await xiaomi.cookies();
    await browser.close();

    return cookies;
};

module.exports = {
    getCookie,
    cookies: ['Your xiaomi cookie, should be an ObjectArray']
};
