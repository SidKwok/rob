const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const {log, warn, fail, success} = require('./utils');
const weiboCookie = require('./weibo').cookies;
const xiaomiCookie = require('./xiaomi').cookies;

module.exports = async (initFcode = '', debug = false) => {
    const browser = await puppeteer.launch({headless: false});
    const weibo = await browser.newPage();
    const xiaomi = await browser.newPage();

    // init pages
    await xiaomi.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36');
    await xiaomi.setCookie(...xiaomiCookie);
    await weibo.setCookie(...weiboCookie);

    // wait for f code
    await xiaomi.goto('https://order.mi.com/queue/f2code');
    await xiaomi.click('#J_fcodeSubmit');

    async function getFcode() {
        await weibo.goto('https://m.weibo.cn/status/4225912910450614');
        await weibo.waitFor('#app > div:nth-child(1) > div > div.card.m-panel.card9.weibo-member > div > div > article > div > div.weibo-text');
        return await weibo.evaluate(() => {
            const text = document.querySelector('#app > div:nth-child(1) > div > div.card.m-panel.card9.weibo-member > div > div > article > div > div.weibo-text').innerHTML.trim();
            const index = text.lastIndexOf('XMFM');
            return text.split('').slice(index, index + 21).join('');
        });
    }

    function screenshot(name) {
        return debug
            ? xiaomi.screenshot({path: `../output/${name}.jpg`, fullPage: true})
            : Promise.resolve();
    }

    async function outputContent(name) {
        return debug ?
            fs.outputFile(`../output/${name}.html`, await xiaomi.content())
            : Promise.resolve();
    }

    let fCode = initFcode;
    let times = 0;

    while (initFcode === fCode) {
        weibo.waitFor(200);
        fCode = await getFcode();
        times++;

        // if (times === 3) { break; }
    }

    log(`refresh for ${times} times`);
    log(`processing fCode: ${fCode}`);
    log('change F code');

    // type f code
    await xiaomi.type('#fcode-input', fCode);
    await xiaomi.click('#J_fcodeSubmit');

    log('verify F code');
    await screenshot('1-input-fcode');

    try {
        // 点击立即购物
        await outputContent('verify');
        await xiaomi.waitForSelector('.fcode-result-btn > .btn-primary');
        await screenshot('2-show-mini');
        await xiaomi.click('.fcode-result-btn > .btn-primary');
        log('click shop');
    } catch (e) {
        const text = await xiaomi.evaluate(() => {
            return document.querySelector('body > div.fcode-warp > div.fcode-main.container > form > div.fcode-form-tips')
                .innerHTML
                .split('')
                .slice(21, 48)
                .join('');
        });
        fail(text);
        fail('can not go to cart');
        await browser.close();
        return fCode;
    }

    // 去购物车
    await xiaomi.goto('https://static.mi.com/cart/');
    await screenshot('3-check-cart');
    log('go cart');

    try {
        await xiaomi.waitForSelector('#J_loginBtn');
        await xiaomi.click('#J_loginBtn');
        await xiaomi.waitFor(200);
    } catch (e) {
        warn('no login');
    }

    try {
        // 点击结算
        await xiaomi.click('#J_goCheckout');
        log(`click count`);
        // 等待出现结算页面
        await xiaomi.waitFor('#J_addressList > div:nth-child(1)');
        await screenshot('4-order');
        // 点击第一个地址
        await xiaomi.click('#J_addressList > div:nth-child(1)');
        log(`click address`);
        // 结算
        await xiaomi.click('#J_checkoutToPay');
        await screenshot('5-success');
        log(`pay`);

        success(`${getTime()}: done!`);

        await xiaomi.waitFor(60000);
        process.exit();
    } catch (e) {
        fail(`${fCode} fail!`);
    }

    await browser.close();

    return fCode;
};
