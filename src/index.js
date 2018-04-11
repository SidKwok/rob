const {hold, log} = require('./utils');
const run = require('./run');

async function circle (fCode) {
    log('on hold');
    await hold();
    log('start!');
    circle(await run(fCode, false));
}

circle('XMFM49635496528612245');
