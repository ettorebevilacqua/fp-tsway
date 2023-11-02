# Monoid

## "type class" on wikipedia

The programmer defines a type class by specifying a set of functions or constant names, together with their respective types, that must exist for every type that belongs to the class.

In fp-ts type classes are encoded as TypeScript interfaces.

A type class Eq, intended to contain types that admit equality, is declared in the following way

```js
interface Eq<A> { /** returns `true` if `x` is equal to `y` */
  readonly equals: (x: A, y: A) => boolean
}
```

The declaration may be read as
a type A belongs to type class Eq if there is a function named equal of the appropriate type, defined on it

What about the instances?
A programmer can make any type A a member of a given type class C by using an instance declaration that defines implementations of all of C's members for the particular type A.

In fp-ts instances are encoded as static dictionaries.

```js
// As an example here's the instance of Eq for the type number
const eqNumber: Eq<number> = {
  equals: (x, y) => x === y
}
```

Instances must satisfy the following laws:

Reflexivity: equals(x, x) === true, for all x in A
Symmetry: equals(x, y) === equals(y, x), for all x, y in A
Transitivity: if equals(x, y) === true and equals(y, z) === true, then equals(x, z) === true, for all x, y, z in A
A programmer could then define a function elem (which determines if an element is in an array) in the following way

```js
function elem<A>(E: Eq<A>): (a: A, as: Array<A>) => boolean {
  return (a, as) => as.some(item => E.equals(item, a))
}

elem(eqNumber)(1, [1, 2, 3]) // true
elem(eqNumber)(4, [1, 2, 3]) // false
```

Let's write some Eq instances for more complex types

```js
type Point = { x: number, y: number }

const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1.x === p2.x && p1.y === p2.y
}
```

We can even try to optimize equals by first checking reference equality

This is mostly boilerplate though. The good news is that we can build an Eq instance for a struct like Point if we can provide an Eq instance for each field.

```js
const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1 === p2 || (p1.x === p2.x && p1.y === p2.y)
}
```

Indeed the fp-ts/Eq module exports a getStructEq combinator:

```js
import { getStructEq } from 'fp-ts/Eq'
const eqPoint: Eq<Point> = getStructEq({ x: eqNumber, y: eqNumber })
```

We can go on and feed getStructEq with the instance just defined

```js
type Vector = { from: Point, to: Point }
const eqVector: Eq<Vector> = getStructEq({ from: eqPoint, to: eqPoint })
```

getStructEq is not the only combinator provided by fp-ts, here's a combinator that allows to derive an Eq instance for arrays

```js
import { getEq } from 'fp-ts/Array'
const eqArrayOfPoints: Eq<Array<Point>> = getEq(eqPoint)
```

Finally another useful way to build an Eq instance is the contramap combinator: given an instance of Eq for A and a function from B to A, we can derive an instance of Eq for B

```js
import { contramap } from 'fp-ts/Eq'
type User = { userId: number; name: string }

/** two users are equal if their `userId` field is equal */
const eqUser = contramap((user: User) => user.userId)(eqNumber)

eqUser.equals({ userId: 1, name: 'Giulio' }, { userId: 1, name: 'Giulio Canti' }) // true
eqUser.equals({ userId: 1, name: 'Giulio' }, { userId: 2, name: 'Giuli
```

## ord

A type class Ord, intended to contain types that admit a total ordering, is declared in the following way

```js
import { Eq } from 'fp-ts/Eq'
type Ordering = -1 | 0 | 1

interface Ord<A> extends Eq<A> {
  readonly compare: (x: A, y: A) => Ordering
}
```

We say that

x < y if and only if compare(x, y) is equal to -1
x is equal to y if and only if compare(x, y) is equal to 0
x > y if and only if compare(x, y) is equal to 1
As a consequence we can say that x <= y if and only if compare(x, y) <= 0

As an example here's the instance of Ord for the type number

```js
const ordNumber: Ord<number> = {
  equals: (x, y) => x === y,
  compare: (x, y) => (x < y ? -1 : x > y ? 1 : 0)
}
```

Instances must satisfy the following laws:

Reflexivity: compare(x, x) === 0, for all x in A
Antisymmetry: if compare(x, y) <= 0 and compare(y, x) <= 0 then x is equal to y, for all x, y in A
Transitivity: if compare(x, y) <= 0 and compare(y, z) <= 0 then compare(x, z) <= 0, for all x, y, z in A
Additionally compare must comply with Eq's equals:

compare(x, y) === 0 if and only if equals(x, y) === true, for all x, y in A

Note. A lawful equals can be derived from compare in the following way

```js
equals: (x, y) => compare(x, y) === 0
```

Indeed the module fp-ts/Ord exports an handy fromCompare helper which allows you to define an Ord instance by simply specifying a compare function

```js
import { Ord, fromCompare } from 'fp-ts/Ord'

const ordNumber: Ord<number> = fromCompare((x, y) => (x < y ? -1 : x > y ? 1 : 0))
```

A programmer could then define a function min (which takes the minimum of two values) in the following way

```js
function min<A>(O: Ord<A>): (x: A, y: A) => A {
  return (x, y) => (O.compare(x, y) === 1 ? y : x)
}
min(ordNumber)(2, 1) // 1
```

Totality might seem obvious (i.e. either x <= y or y <= x) when we're talking about numbers, but this isn't always the case. Let's consider a more complex type

```js
type User = { name: string age: number}
```

How can we define an Ord< User >?
Well it really depends, but a possible choice is to sort users by their age

```js
const byAge: Ord<User> = fromCompare((x, y) => ordNumber.compare(x.age, y.age))
```

We can avoid some boilerplate by using the contramap combinator: given an instance of Ord for A and a function
from B to A, we can derive an instance of Ord for B

```js
import { contramap } from 'fp-ts/Ord'

const byAge: Ord<User> = contramap((user: User) => user.age)(ordNumber)
```

Now we can pick the younger of two users using min

```js
const getYounger = min(byAge)

getYounger({ name: 'Guido', age: 48 }, { name: 'Giulio', age: 45 }) // { name: 'Giulio', age: 45 }
```

What if we want to pick the older instead? We'd need to "reverse the order", or more technically speaking, get the dual order.

Fortunately there's another exported combinator for this

```js
import { getDualOrd } from 'fp-ts/Ord'

function max<A>(O: Ord<A>): (x: A, y: A) => A {
  return min(getDualOrd(O))
}

const getOlder = max(byAge)

getOlder({ name: 'Guido', age: 48 }, { name: 'Giulio', age: 45 }) // { name: 'Guido', age: 48 }
```

## SEMIGROUP

A semigroup is a pair (A, *) in which A is a non-empty set and* is a binary associative operation on A, i.e. a function that takes two elements of A as input and returns an element of A as output...

*: (x: A, y: A) => A

... while associative means that the equation
(x *y)* z = x *(y* z)

holds for all x, y, z in A.

Associativity simply tells us that we do not have to worry about parenthesizing an expression and can write x *y* z.

Semigroups capture the essence of parallelizable operations

There are plenty of examples of semigroups:

(number, *) where* is the usual multiplication of numbers
(string, +) where + is the usual concatenation of strings
(boolean, &&) where && is the usual conjunction

### Type class definition

As usual in fp-ts the type class Semigroup, contained in the fp-ts/Semigroup module, is implemented as a TypeScript interface, where the operation * is named concat
interface Semigroup<A> {
  concat: (x: A, y: A) => A
}
The following law must hold

Associativity: concat(concat(x, y), z) = concat(x, concat(y, z)), for all x, y, z in A
The name concat makes a particular sense for arrays (see later) but, based on the context and the type A for which we are implementing an instance, the semigroup operation can be interpreted with different meanings

"concatenation", "merging", "fusion", "selection", "addition", "substitution"...

### Instances

This is how we can implement the semigroup (number, *)

```js
/** number `Semigroup` under multiplication */
const semigroupProduct: Semigroup<number> = {
  concat: (x, y) => x * y
}
```

Note that you can define different semigroup instances for the same type. Here's the implementation of the semigroup (number, +) where + is the usual addition of numbers

```js
/** number `Semigroup` under addition */
const semigroupSum: Semigroup<number> = {
  concat: (x, y) => x + y
}
/** number `Semigroup` under addition */
const semigroupSum: Semigroup<number> = {
  concat: (x, y) => x + y
}
// Another example, with strings this time
const semigroupString: Semigroup<string> = {
  concat: (x, y) => x + y
}
```

### I can't find an instance

What if, given a type A, you can't find an associative operation on A? You can create a (trivial) semigroup instance for every type just using the following constructions

```js
/** Always return the first argument */
function getFirstSemigroup<A = never>(): Semigroup<A> {
  return { concat: (x, y) => x }
}

/** Always return the second argument */
function getLastSemigroup<A = never>(): Semigroup<A> {
  return { concat: (x, y) => y }
}
```

Another technique is to define a semigroup instance for Array<A> (*), called the free semigroup of A.

```js
function getArraySemigroup<A = never>(): Semigroup<Array<A>> {
  return { concat: (x, y) => x.concat(y) }
}

// and map the elements of A to the singleton elements of Array<A>

function of<A>(a: A): Array<A> {
  return [a]
}
```

(*) strictly speaking is a semigroup instance for non empty arrays of A

Note. Here concat is the native array method, which kind of explains the initial choice for the name of the Semigroup operation.

The free semigroup of A is the semigroup whose elements are all possible non-empty finite sequences of elements of A.

### Deriving from Ord

There's another way to build a semigroup instance for a type A: if we already have an Ord instance for A, then we can "turn it" into a semigroup.

Actually two possible semigroups

```js
import { ordNumber } from 'fp-ts/Ord'
import { getMeetSemigroup, getJoinSemigroup } from 'fp-ts/Semigroup'

/** Takes the minimum of two values */
const semigroupMin: Semigroup<number> = getMeetSemigroup(ordNumber)

/** Takes the maximum of two values  */
const semigroupMax: Semigroup<number> = getJoinSemigroup(ordNumber)

semigroupMin.concat(2, 1) // 1
semigroupMax.concat(2, 1) // 2
```

Let's write some Semigroup instances for more complex types

```js
type Point = { x: number y: number}

const semigroupPoint: Semigroup<Point> = {
  concat: (p1, p2) => ({
    x: semigroupSum.concat(p1.x, p2.x),
    y: semigroupSum.concat(p1.y, p2.y)
  })
}
```

This is mostly boilerplate though. The good news is that we can build a Semigroup instance for a struct like Point if we can provide a Semigroup instance for each field.

Indeed the fp-ts/Semigroup module exports a getStructSemigroup combinator:

```js
import { getStructSemigroup } from 'fp-ts/Semigroup'

const semigroupPoint: Semigroup<Point> = getStructSemigroup({
  x: semigroupSum,  y: semigroupSum })
```

We can go on and feed getStructSemigroup with the instance just defined

```js
type Vector = { from: Point  to: Point }

const semigroupVector: Semigroup<Vector> = getStructSemigroup({
  from: semigroupPoint,
  to: semigroupPoint
})
```

getStructSemigroup is not the only combinator provided by fp-ts, here's a combinator that allows to derive a Semigroup instance for functions: given an instance of Semigroup for S we can derive an instance of Semigroup for functions with signature (a: A) => S, for all A

```js
import { getFunctionSemigroup, Semigroup, semigroupAll } from 'fp-ts/Semigroup'

/** `semigroupAll` is the boolean semigroup under conjunction */
const semigroupPredicate: Semigroup<(p: Point) => boolean> = getFunctionSemigroup(
  semigroupAll )<Point>()

// Now we can "merge" two predicates on Points :
const isPositiveX = (p: Point): boolean => p.x >= 0
const isPositiveY = (p: Point): boolean => p.y >= 0
const isPositiveXY = semigroupPredicate.concat(isPositiveX, isPositiveY)

isPositiveXY({ x: 1, y: 1 }) // true
isPositiveXY({ x: 1, y: -1 }) // false
isPositiveXY({ x: -1, y: 1 }) // false
isPositiveXY({ x: -1, y: -1 }) // false
```

### Folding

By definition concat works with only two elements of A, what if we want to concat more elements?

The fold function takes a semigroup instance, an initial value and an array of elements:

```js
import { fold, semigroupSum, semigroupProduct } from 'fp-ts/Semigroup'

const sum = fold(semigroupSum)
sum(0, [1, 2, 3, 4]) // 10

const product = fold(semigroupProduct)
product(1, [1, 2, 3, 4]) // 24
```

### Semigroups for type constructors

What if we want to "merge" two Option<A>? There are four cases:

| x   |      y      |  concat(x, y) |
|----------|:-------------:|------:|
| none |  none | none |
| some(a) | none | none |
| none | some(a) | none |
| some(a) | some(b)  | ? |

There's a problem with the last one, we'd need something to "merge" two As.

That's what Semigroup does! We can require a semigroup instance for A and then derive a semigroup instance for Option<A>. This is how the getApplySemigroup combinator works

```js
import { semigroupSum } from 'fp-ts/Semigroup'
import { getApplySemigroup, some, none } from 'fp-ts/Option'

const S = getApplySemigroup(semigroupSum)

S.concat(some(1), none) // none
S.concat(some(1), some(2)) // some(3)
```

### example :

Let's imagine you're building some system in which you store customer records that look like this:

```js
interface Customer {
  name: string
  favouriteThings: Array<string>
  registeredAt: number // since epoch
  lastUpdatedAt: number // since epoch
  hasMadePurchase: boolean
}
```

For whatever reason you might end up with duplicate records for the same person. What we need is a merge strategy. That's what semigroups are all about

```js
import {
  Semigroup, getStructSemigroup, getJoinSemigroup, getMeetSemigroup, semigroupAny
} from 'fp-ts/Semigroup'
import { getMonoid } from 'fp-ts/Array'
import { ordNumber, contramap } from 'fp-ts/Ord'

const semigroupCustomer: Semigroup<Customer> = getStructSemigroup({
  // keep the longer name
  name: getJoinSemigroup(contramap((s: string) => s.length)(ordNumber)),
  // accumulate things
  favouriteThings: getMonoid<string>(), // <= getMonoid returns a Semigroup for `Array<string>` see later
  // keep the least recent date
  registeredAt: getMeetSemigroup(ordNumber),
  // keep the most recent date
  lastUpdatedAt: getJoinSemigroup(ordNumber),
  // Boolean semigroup under disjunction
  hasMadePurchase: semigroupAny
})

semigroupCustomer.concat(
  {
    name: 'Giulio',
    favouriteThings: ['math', 'climbing'],
    registeredAt: new Date(2018, 1, 20).getTime(),
    lastUpdatedAt: new Date(2018, 2, 18).getTime(),
    hasMadePurchase: false
  },
  {
    name: 'Giulio Canti',
    favouriteThings: ['functional programming'],
    registeredAt: new Date(2018, 1, 22).getTime(),
    lastUpdatedAt: new Date(2018, 2, 9).getTime(),
    hasMadePurchase: true
  }
)
/*
{ name: 'Giulio Canti',
  favouriteThings: [ 'math', 'climbing', 'functional programming' ],
  registeredAt: 1519081200000, // new Date(2018, 1, 20).getTime()
  lastUpdatedAt: 1521327600000, // new Date(2018, 2, 18).getTime()
  hasMadePurchase: true }
*/
```

The function getMonoid returns a Semigroup for Array<string>. Actually it returns something more than a semigroup: a monoid.

