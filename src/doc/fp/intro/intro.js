const log = (msg, val) => (console.log(msg, val), val)
const logC = (msg) => (val) => (console.log(msg, val), val)
const doError = (msg) => (val) => { throw ('error of  ' + val) }

const double = (val) => val * 2
const sum = (num1) => (num2) => num1 + num2
const divide = (num1) => (num2) => num2 / num1

let val1 = Promise.resolve(2);
const promiseDoubleSum = val1.then(double).then(double).then(sum(4))
const promiseDivide = val1.then(double).then(divide(0))
const promiseDivideError = val1.then(double).then(divideThrow(0))
const promiseDoError = val1.then(double).then(doError(' im error'))

async function main() {
   promiseDoubleSum.then(logC('promiseDoubleSum -----'))
   promiseDivide.then(logC('promiseDivide Infinity -----')).catch(e => logC('-->catch promiseDivide'))
   Promise.resolve(0).then(divide(0)).then(logC('divide by 0 NaN -----')).catch(logC('--> catch promiseDivide'))
   promiseDivideError.then(logC('promiseDivideError -----')).catch(logC('--> catch promiseDivideError'))
   promiseDoError.then(logC('promiseDoError ----')).catch(logC('--> catch promiseDoError'))
}

main()
