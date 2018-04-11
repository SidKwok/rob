const moment = require('moment');
const delay = require('delay');
const chalk = require('chalk');

const getTime = () => new Date().toLocaleString();

function hold() {
    const duration = moment().endOf('hour').format('x') - +new Date();
    return delay(duration);
}

const log = msg => {
    console.log(chalk.blue(`${getTime()}: ${msg}`));
};

const fail = msg => {
    console.log(chalk.red(`${getTime()}: ${msg}`));
};

const success = msg => {
    console.log(chalk.green(`${getTime()}: ${msg}`));
};

const warn = msg => {
    console.log(chalk.yellow(`${getTime()}: ${msg}`));
}

module.exports = {
    getTime,
    hold,
    log,
    fail,
    success,
    warn
};
