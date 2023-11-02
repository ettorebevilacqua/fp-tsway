### Combinator

<https://dev.to/gcanti/functional-design-tagless-final-332k>

A style of organizing libraries centered around the idea of combining things. Usually there is some type T, some "primitive" values of type T, and some "combinators" which can combine values of type T in various ways to build up more complex values of type T

So the general shape of a combinator is
combinator: Thing -> Thing

The goal of a combinator is to create new "things" from previously defined "things

Since the result can be passed back as input, you get a combinatorial explosion of possibilities, which makes this pattern very powerful.

If you mix and match several combinators together, you get an even larger combinatorial explosion.

So a design that you may often find in a functional module is

a small set of very simple "primitives"
a set of "combinators" for combining them into more complicated structures
Let's see some examples.

```js
import { Eq, fromEquals } from 'fp-ts/Eq'

export function getEq<A>(E: Eq<A>): Eq<ReadonlyArray<A>> {
  return fromEquals(
    (xs, ys) => xs.length === ys.length && xs.every((x, i) => E.equals(x, ys[i]))
  )
}
```

Usage :

```js
/** a primitive `Eq` instance for `number` */
export const eqNumber: Eq<number> = {
  equals: (x, y) => x === y
}

// derived
export const eqNumbers: Eq<ReadonlyArray<number>> = getEq(eqNumber)

// derived
export const eqNumbersNumbers: Eq<ReadonlyArray<ReadonlyArray<number>>> = getEq(
  eqNumbers
)

// derived
export const eqNumbersNumbersNumbers: Eq<ReadonlyArray<
  ReadonlyArray<ReadonlyArray<number>>>> = getEq(eqNumbersNumbers)
```

Another combinator, contramap: given an instance of Eq for A and a function from B to A, we can derive an instance of Eq for B

```js
import { Eq, fromEquals } from 'fp-ts/Eq'

export const contramap = <A, B>(f: (b: B) => A) => (E: Eq<A>): Eq<B> =>
  fromEquals((x, y) => E.equals(f(x), f(y)))
```

usage

```js
import { contramap, Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as RA from 'fp-ts/ReadonlyArray'

export interface User {
  id: number
  name: string
}

export const eqUser: Eq<User> = pipe(
  N.Eq,
  contramap((user: User) => user.id)
)

export const eqUsers: Eq<Array<User>> = RA.getEq(eqUser)
```

## Example 2: Monoid

The getMonoid combinator: given an instance of Monoid for A, we can derive an instance of Monoid for IO<A>

```js
import { IO } from 'fp-ts/IO'
import { Monoid } from 'fp-ts/Monoid'

export function getMonoid<A>(M: Monoid<A>): Monoid<IO<A>> {
  return {
    concat: (x, y) => () => M.concat(x(), y()),
    empty: () => M.empty
  }
}
```

## Example 2: Monoid

The getMonoid combinator: given an instance of Monoid for A, we can derive an instance of Monoid for IO<A>

```js
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

```js
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

```js
// helpers

/** logs to the console */
export function log(message: unknown): IO<void> {
  return () => console.log(message)
}

/** returns a random integer between `low` and `high` */
export const randomInt = (low: number, high: number): IO<number> =>
   () => Math.floor((high - low + 1) * Math.random() + low)

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
/* 1346269, 9227465, 3524578 */
```

### Example 3: IO

We can build many other combinators for IO, for example the time combinator mimics the analogous Unix command: given an action IO<A>, we can derive an action IO<A> that prints to the console the elapsed time

```js
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

time(replicateIO(3, printFib))()
// 5702887, 1346269. 14930352, Elapsed: 193 
```

With partials...

```js
time(replicateIO(3, time(printFib)))()
/*
3524578, Elapsed: 32
14930352, Elapsed: 125
3524578, Elapsed: 32
Elapsed: 189
*/
```

There are two problems with this combinator though:

```js
export function time<A>(ma: IO<A>): IO<A> {
  return io.chain(now, start =>
    io.chain(ma, a => io.chain(now, end => io.map(log(`Elapsed: ${end - start}`), () => a)))
  )
}
```

There are two problems with this combinator though:

is not flexible, i.e. consumers can't choose what to do with the elapsed time
works with IO only
In this article we'll tackle the first problem.

## Adding flexibility by returning the elapsed time

Instead of always logging, we can return the elapsed time along with the computed value

```js
export function time<A>(ma: IO<A>): IO<[A, number]> {
  return io.chain(now, start => io.chain(ma, a => io.map(now, end => [a, end - start])))
}
```

Now a user can choose what to do with the elapsed time by defining its own combinators.

We could still log to the console...

```js
export function withLogging<A>(ma: IO<A>): IO<A> {
  return io.chain(time(ma), ([a, millis]) =>
    io.map(log(`Result: ${a}, Elapsed: ${millis}`), () => a)
  )
}

import { randomInt } from 'fp-ts/Random'

function fib(n: number): number {
  return n <= 1 ? 1 : fib(n - 1) + fib(n - 2)
}

const program = withLogging(io.map(randomInt(30, 35), fib))

program() // Result: 14930352, Elapsed: 127
```

...or just ignore the elapsed time...

```js
export function ignoreSnd<A>(ma: IO<[A, unknown]>): IO<A> {
  return io.map(ma, ([a]) => a)
}
```

...or, for example, only keep the fastest of a non empty list of actions

```js
import { fold, getMeetSemigroup } from 'fp-ts/Semigroup'
import { contramap, ordNumber } from 'fp-ts/Ord'
import { getSemigroup } from 'fp-ts/IO'

export function fastest<A>(head: IO<A>, tail: Array<IO<A>>): IO<A> {
  const ordTuple = contramap(([_, elapsed]: [A, number]) => elapsed)(ordNumber)
  const semigroupTuple = getMeetSemigroup(ordTuple)
  const semigroupIO = getSemigroup(semigroupTuple)
  const fastest = fold(semigroupIO)(time(head), tail.map(time))
  return ignoreSnd(fastest)
}
```

```js
io.chain(fastest(program, [program, program]), a => log(`Fastest result is: ${a}`))()
/*
Result: 5702887, Elapsed: 49
Result: 2178309, Elapsed: 20
Result: 5702887, Elapsed: 57
Fastest result is: 2178309 */
```

# Appendix

The implementation of fastest is quite dense, let's see the relevant bits:

1) its signature ensures that we provide a non empty list of actions

```js
//  at least one action --v            v--- possibly other actions
function fastest<A>(head: IO<A>, tail: Array<IO<A>>): IO<A>
```

2) contramap is an Ord combinator: given an instance of Ord for T and a function from U to T, we can derive an instance of Ord for U.

Here T = number and U = [A, number]

```js
// from `Ord<number>` to `Ord<[A, number]>`
const ordTuple = contramap(([_, elapsed]: [A, number]) => elapsed)(ordNumber)
```

3) getMeetSemigroup transforms an instance of Ord<T> into an instance of Semigroup<T> which, when combining two values, returns the smaller

```js
// from `Ord<[A, number]>` to `Semigroup<[A, number]>`
const semigroupTuple = getMeetSemigroup(ordTuple)
```

4) getSemigroup is a Semigroup combinator: given an instance of Semigroup for T, we can derive an instance of Semigroup for IO<T>

```js
// from `Semigroup<[A, number]>` to `Semigroup<IO<[A, number]>>`
const semigroupIO = getSemigroup(semigroupTuple)
```

5) fold reduces a non empty list of actions using the provided Semigroup

```js
// from a non empty list of `IO<[A, number]>` to `IO<[A, number]>`
const fastest = fold(semigroupIO)(time(head), tail.map(time))
```

6) finally we ignore the elapsed time and return just the value

```js
// from `IO<[A, number]>` to `IO<A>`
return ignoreSnd(fastest)
```

```js
```

```js
```

```js
```
