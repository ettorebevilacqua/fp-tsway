import * as F from 'fp-ts'
import { getApplySemigroup } from 'fp-ts/lib/Apply'
import {  } from 'fp-ts/lib/Option'
import { Semigroup, concatAll } from "fp-ts/lib/Semigroup"
import { SemigroupAll } from 'fp-ts/lib/boolean'
import { getSemigroup } from 'fp-ts/lib/function'
import { SemigroupSum } from 'fp-ts/lib/number'
const {semigroup:{struct}} = F
type Point = {
    x: number
    y: number
}

const semigroupPoint: Semigroup<Point> = struct({
    x: SemigroupSum,
    y: SemigroupSum
})

type Vector = {
    from: Point
    to: Point
}

const semigroupVector: Semigroup<Vector> = struct({
    from: semigroupPoint,
    to: semigroupPoint
})

/** `semigroupAll` is the boolean semigroup under conjunction */
const semigroupPredicate: Semigroup<(p: Point) => boolean> = getSemigroup(
    SemigroupAll
)<Point>()

const isPositiveX = (p: Point): boolean => p.x >= 0
const isPositiveY = (p: Point): boolean => p.y >= 0

const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY)

isPositiveXY({ x: 1, y: 1 }) // true
isPositiveXY({ x: 1, y: -1 }) // false
isPositiveXY({ x: -1, y: 1 }) // false
isPositiveXY({ x: -1, y: -1 }) // false


// fold
const semigroupProduct: Semigroup<number> = ({ concat: (x, y) => x * y })

const sum =  concatAll(SemigroupSum)
sum(0)([1, 2, 3, 4]) // 10

const product = concatAll(semigroupProduct)
product(1)([1, 2, 3, 4]) // 24

// const S =  getApplySemigroup(SemigroupSum)


const semigroupSumX: Semigroup<number> = ({ concat: (x, y) => x + y })

const semigroupPointRaw: Semigroup<Point> = {
    concat: (p1, p2) => ({
        x: semigroupSumX.concat(p1.x, p2.x),
        y: semigroupSumX.concat(p1.y, p2.y)
    })
}

const aaa = semigroupPointRaw.concat({ x: 2, y: 4 }, { x: 2, y: 3 })
const bbb = semigroupPoint.concat({ x: 2, y: 3 }, { x: 2, y: 7 })

console.log('semigroup aaa', aaa)
console.log('semigroup bbb', bbb)


