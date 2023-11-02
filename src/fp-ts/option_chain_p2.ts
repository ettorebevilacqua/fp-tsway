// Option, Map, Flatten, Chain

import { flow, pipe } from "fp-ts/lib/function"
import * as O from 'fp-ts/lib/Option'


// https://rlee.dev/practical-guide-to-fp-ts-part-2

// map with pipe
const foo = { bar: 'hello' }
pipe(foo, (f) => f.bar) // hello

interface Foo { bar?: string }
const foo2 = { bar: 'hello' } as Foo | undefined

// O.fromNullable create new option some or none, for map with no error
pipe(foo2, O.fromNullable, O.map(({ bar }) => bar)) // { _tag: 'Some', value: 'hello' }
pipe(undefined, O.fromNullable, O.map(({ bar }) => bar)) // { _tag: 'None' }

// Flatten

interface Fizz { buzz: string }
interface Foo3 { bar?: Fizz }

const foo3 = { bar: undefined } as Foo3 | undefined
pipe(foo3, (f) => f?.bar?.buzz) // undefined

// From nullable for eache deep level bad solution nesteted option and 
pipe(foo3, O.fromNullable, O.map(({ bar }) =>
    pipe(bar, O.fromNullable, O.map(({ buzz }) => buzz),)),
) // { _tag: 'Some', value: { _tag: 'None' } }

// the first option on result has value, becouse foo3.bar is definited
// the second value: { _tag: 'None' }  is none becouse foo.bar.buzz is undefined.

// you would need to traverse the Option's nested list of tags every time.

pipe(foo3, O.fromNullable, O.map(({ bar }) =>
    pipe(bar, O.fromNullable, O.map(({ buzz }) => buzz),)),
    O.flatten,
) //  // { _tag: 'None' } that represents the last Option in the pipeline

// Chain (Flatmap)

pipe(foo3, O.fromNullable, O.map(({ bar }) => bar),
    O.chain(flow( // flow is free poit, pipe start with a values
        O.fromNullable, O.map(({ buzz }) => buzz),)
    )) // // { _tag: 'None' }


// conclusion 
// And just like how you can lift undefined into an Option, you can also lift an Option into another fp-ts container, like Either.