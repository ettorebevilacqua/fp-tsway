class IO {
    static of(x) { return new IO(() => x); }
    constructor(fn) { this.$value = fn}
    map(fn) { return new IO(compose(fn, this.$value))}
    inspect() {return `IO(${inspect(this.$value)})` }
}

const log = msg => val => (console.log(msg, val), val)
const head = xs => xs[0];
const split = sep => str => str.split(sep);
const prop = x => obj => obj[x];
const safeProp = x => obj => Maybe.of(obj[x]);
const compose = (...fns) => (...args) => fns.reduceRight((res, fn) => [fn.call(null, ...res)], args)[0];

// ioWindow :: IO Window
const ioWindow = new IO(() => window);

const innerWidth = ioWindow.map(win => win.innerWidth);
// IO(1430)
const valInnerWidth = innerWidth.map(log('val map'))
valInnerWidth.$value()

ioWindow
    .map(prop('location'))
    .map(prop('href'))
    .map(split('/'));
// IO(['http:', '', 'localhost:8000', 'blog', 'posts'])

// $ :: String -> IO [DOM]
const $ = selector => new IO(() => document.querySelectorAll(selector));

const aa = $('#myDiv').map(head).map(div => div.innerHTML);
// log('aa')(4)
const bb = aa.map(log('aaa'))
bb.$value()