const { xnor } = require('rambdax');
const L = require('./lib');
const U = require('util');

const logc = console.log.bind(console);
const log = (msg, param) =>  (logc(msg, param), param);

console.log('start 2',log('ss', 4, 'ss'));

