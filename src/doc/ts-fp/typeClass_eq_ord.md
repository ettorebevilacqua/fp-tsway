# Type Class

https://book.purescript.org/chapter6.html

class Show a where
  show :: a -> String

This code declares a new type class called Show, which is parameterized by the type variable a.

A type class instance contains implementations of the functions defined in a type class, specialized to a particular type.

For example, here is the definition of the Show type class instance for Boolean values, taken from the Prelude:

instance Show Boolean where
  show true = "true"
  show false = "false"

the type class show tell that a generic value a is transoform to string
it not explain how it must do that for that like a class in OO we must make different implementations for every type a that we want use.

Another definition :

The programmer defines a type class by specifying a set of functions or constant names, together with their respective types, that must exist for every type that belongs to the class.

In fp-ts type classes are encoded as TypeScript interfaces.

A type class Eq, intended to contain types that admit equality, is declared in the following way

```ts
interface Eq<A> { /** returns `true` if `x` is equal to `y` */
  readonly equals: (x: A, y: A) => boolean
}
```

The declaration may be read as

a type A belongs to type class Eq if there is a function named equal of the appropriate type, defined on its

### What about the instances?

A programmer can make any type A a member of a given type class C by using an instance declaration that defines implementations of all of C's members for the particular type A.

In fp-ts instances are encoded as static dictionaries.
As an example here's the instance of Eq for the type number

```ts
const eqNumber: Eq<number> = {
  equals: (x, y) => x === y
}
```

Instances must satisfy the following laws:

- Reflexivity: equals(x, x) === true, for all x in A
- Symmetry: equals(x, y) === equals(y, x), for all x, y in A
- Transitivity: if equals(x, y) === true and equals(y, z) === true, then equals (x, z) === true, for all x, y, z in A

A programmer could then define a function elem (which determines if an element is in an array) in the following way

```ts
function elem<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
  return (a, as) => as.some(item => E.equals(item, a))
}

elem(eqNumber)(1, [1, 2, 3]) // true
elem(eqNumber)(4, [1, 2, 3]) // false
```

Let's write some Eq instances for more complex types

```ts
type Point = {
  x: number
  y: number
}

const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1.x === p2.x && p1.y === p2.y
}
```

We can even try to optimize equals by first checking reference equality

```ts
const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1 === p2 || (p1.x === p2.x && p1.y === p2.y)
}
```

This is mostly boilerplate though. The good news is that we can build an Eq instance for a struct like Point if we can provide an Eq instance for each field.

Indeed the fp-ts/Eq module exports a getStructEq combinator:

```ts
import { getStructEq } from 'fp-ts/Eq'

const eqPoint: Eq<Point> = getStructEq({
  x: eqNumber,
  y: eqNumber
})
```

We can go on and feed getStructEq with the instance just defined

```ts
type Vector = {
const eqUser = contramap((user: User) => user.userId)(eqNumb
  from: Point
  to: Point
}

const eqVector: Eq<Vector> = getStructEq({
  from: eqPoint,
  to: eqPoint
})
```

getStructEq is not the only combinator provided by fp-ts, here's a combinator that allows to derive an Eq instance for arrays

```ts
import { getEq } from 'fp-ts/Array'
const eqArrayOfPoints: Eq<Array<Point>> = getEq(eqPoint)
```

Finally another useful way to build an Eq instance is the contramap combinator: given an instance of Eq for A and a function from B to A, we can derive an instance of Eq for B

```ts
import { contramap } from 'fp-ts/Eq'

type User = {
  userId: number
  name: string
}

/** two users are equal if their `userId` field is equal */er)

eqUser.equals({ userId: 1, name: 'Giulio' }, { userId: 1, name: 'Giulio Canti' }) // true
eqUser.equals({ userId: 1, name: 'Giulio' }, { userId: 2, name: 'Giulio' }) // false
```

### Combinator

n this article the term "combinator" refers to the combinator pattern

A style of organizing libraries centered around the idea of combining things. Usually there is some type T, some "primitive" values of type T, and some "combinators" which can combine values of type T in various ways to build up more complex values of type T

So the general shape of a combinator is
***combinator: Thing -> Thing***

The goal of a combinator is to create new "things" from previously defined "things".

Example 1: ***Eq***s
The getEq combinator: given an instance of Eq for A, we can derive an instance of Eq for ReadonlyArray<A>

```ts
import { Eq, fromEquals } from 'fp-ts/Eq'
export const getEq = <A>(E: Eq<A>): Eq<ReadonlyArray<A>> =>
   fromEquals( (xs, ys) =>
      xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i])) )
```

Usage

```ts
/** a primitive `Eq` instance for `number` */
export const eqNumber: Eq<number> = {equals: (x, y) => x === y}

// derived
export const eqNumbers: Eq<ReadonlyArray<number>> = getEq(eqNumber)
export const eqNumbersNumbers: Eq<ReadonlyArray<ReadonlyArray<number>>> = getEq(
  eqNumbers
)
export const eqNumbersNumbersNumbers: Eq<ReadonlyArray<ReadonlyArray<ReadonlyArray<number>>>> = getEq(eqNumbersNumbers)

// etc...
```

Another combinator, contramap: given an instance of Eq for A and a function from B to A, we can derive an instance of Eq for B

```ts
import { Eq, fromEquals } from 'fp-ts/Eq'

export const contramap = <A, B>(f: (b: B) => A) => (E: Eq<A>): Eq<B> =>
  fromEquals((x, y) => E.equals(f(x), f(y)))
```

Usage

```ts
import { contramap, Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as RA from 'fp-ts/ReadonlyArray'

export interface User {
  id: number
  name: string
}
contramap(122<>)
export const eqUser: Eq<User> = pipe(
  N.Eq, contramap((user: User) => user.id))

export const eqUsers: Eq<Array<User>> = RA.getEq(eqUser)
```

Example 2: ***Monoid***

The getMonoid combinator: given an instance of Monoid for A, we can derive an instance of Monoid for IO<A>

```ts
import { IO } from 'fp-ts/IO'
import { Monoid } from 'fp-ts/Monoid'

export function getMonoid<A>(M: Monoid<A>): Monoid<IO<A>> {
  return {
    concat: (x, y) => () => M.concat(x(), y()),
    empty: () => M.empty
  }
}
```

We can use getMonoid to derive another combinator, replicateIO: given a number n and an action mv of type IO<void>, we can derive an action that performs n times mv

```ts
import { concatAll } from 'fp-ts/Monoid'
import { replicate } from 'fp-ts/ReadonlyArray'

/** a primitive `Monoid` instance for `void` */
export const monoidVoid: Monoid<void> = {
  concat: () => undefined,
  empty: undefined
}

export function replicateIO(n: number, mv: IO<void>): IO<void> {
  return concatAll(getMonoid(monoidVoid))(replicate(n, mv))
}
```

Usage

```ts
// helpers

/** logs to the console */
export function log(message: unknown): IO<void> {
  return () => console.log(message)
}

/** returns a random integer between `low` and `high` */
export const randomInt = (low: number, high: number): IO<number> => {
  return () => Math.floor((high - low + 1) * Math.random() + low)
}

// program
import { chain } from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

function fib(n: number): number {
  return n <= 1 ? 1 : fib(n - 1) + fib(n - 2)
}

/** calculates a random fibonacci and prints the result to the console */
const printFib: IO<void> = pipe(
  randomInt(30, 35),
  chain((n) => log(fib(n)))
)

replicateIO(3, printFib)()
/*
1346269
9227465
3524578
*/
```

Example 3: ***IO***

We can build many other combinators for IO, for example the time combinator mimics the analogous Unix command: given an action IO<A>, we can derive an action IO<A> that prints to the console the elapsed time

```ts
import { IO, Monad } from 'fp-ts/IO'
import { now } from 'fp-ts/Date'
import { log } from 'fp-ts/Console'

export function time<A>(ma: IO<A>): IO<A> {
  return Monad.chain(now, (start) =>
    Monad.chain(ma, (a) =>
      Monad.chain(now, (end) =>
        Monad.map(log(`Elapsed: ${end - start}`), () => a)
      )
    )
  )
}
```

Usage

```ts
time(replicateIO(3, printFib))()
/*
5702887
1346269
14930352
Elapsed: 193
*/
With partials...
time(replicateIO(3, time(printFib)))()
/*
3524578
Elapsed: 32
14930352
Elapsed: 125
3524578
Elapsed: 32
Elapsed: 189
*/
```
