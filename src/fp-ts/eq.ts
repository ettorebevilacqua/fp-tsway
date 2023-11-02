import * as C from 'fp-ts/lib/Console'
import { pipe } from 'fp-ts/function'

import { contramap, Eq } from 'fp-ts/Eq'

const log = (a:any)=>C.log(a)()

const eqNumber: Eq<number> = {
    equals: (x, y) => x === y,
}

function elem<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
    return (a, as) => as.some(item => E.equals(item, a))
}

type Point = {
    x: number
    y: number
}

const eqPoint: Eq<Point> = {
    equals: (p1, p2) => p1 === p2 || (p1.x === p2.x && p1.y === p2.y),
}

contramap()
const ris = pipe( eqPoint.equals({x:2, y:3}, {x:2, y:3} ), log)

// log([33,33])
// console.log('ee')