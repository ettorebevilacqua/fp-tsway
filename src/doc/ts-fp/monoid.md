# Monoid

### Type class definition

As usual in fp-ts the type class Monoid, contained in the fp-ts/Monoid module, is implemented as a TypeScript interface, where the neutral value is named empty

```js
import { Semigroup } from 'fp-ts/Semigroup'

interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}
```

The following laws must hold

* Right identity: concat(x, empty) = x, for all x in A
* Left identity: concat(empty, x) = x, for all x in A

Whichever side of concat we put the value empty, it must make no difference to the value.
Note. If an empty value exists then is unique.

Instances
Most of the semigroups we saw in the previous post are actually monoids

```js
/** number `Monoid` under addition */
const monoidSum: Monoid<number> = {
  concat: (x, y) => x + y,
  empty: 0
}

/** number `Monoid` under multiplication */
const monoidProduct: Monoid<number> = {
  concat: (x, y) => x * y,
  empty: 1
}

const monoidString: Monoid<string> = {
  concat: (x, y) => x + y,
  empty: ''
}

/** boolean monoid under conjunction */
const monoidAll: Monoid<boolean> = {
  concat: (x, y) => x && y,
  empty: true
}

/** boolean monoid under disjunction */
const monoidAny: Monoid<boolean> = {
  concat: (x, y) => x || y,
  empty: false
}
```

You may wonder if all semigroups are also monoids. That's not the case, as a counterexample consider the following semigroup

```js
const semigroupSpace: Semigroup<string> = {
  concat: (x, y) => x + ' ' + y
}
```

We can't find an empty value such that concat(x, empty) = x.

Let's write some Monoid instances for more complex types. We can build a Monoid instance for a struct like Point

```js
type Point = { x: number; y: number }
```

if we can provide a Monoid instance for each field

```js
import { getStructMonoid } from 'fp-ts/Monoid'

const monoidPoint: Monoid<Point> = getStructMonoid({
  x: monoidSum,
  y: monoidSum
})
```

We can go on and feed getStructMonoid with the instance just defined

```js
type Vector = { from: Point; to: Point }

const monoidVector: Monoid<Vector> = getStructMonoid({
  from: monoidPoint,
  to: monoidPoint
})
```

Folding
When using a monoid instead of a semigroup, folding is even simpler: we don't need to explicitly provide an initial value (the implementation can use the monoid's empty value for that)

```js
import { fold } from 'fp-ts/Monoid'

fold(monoidSum)([1, 2, 3, 4]) // 10
fold(monoidProduct)([1, 2, 3, 4]) // 24
fold(monoidString)(['a', 'b', 'c']) // 'abc'
fold(monoidAll)([true, false, true]) // false
fold(monoidAny)([true, false, true]) // true
```

### Monoids for type constructors

We already know that given a semigroup instance for A we can derive a semigroup instance for Option<A>.

If we can find a monoid instance for A then we can derive a monoid instance for Option<A> (via getApplyMonoid) which works like this

| x   |      y      |  concat(x, y) |
|----------|:-------------:|------:|
| none |  none | none |
| some(a) | none | some(a) |
| none | some(a) | some(a) |
| some(a) | some(b)  | some(a) |

```js
import { getFirstMonoid, some, none } from 'fp-ts/Option'

const M = getFirstMonoid<number>()

M.concat(some(1), none) // some(1)
M.concat(some(1), some(2)) // some(1)
```

2) ...and its dual: getLastMonoid

Monoid returning the right-most non-None value

| x   |      y      |  concat(x, y) |
|----------|:-------------:|------:|
| none |  none | none |
| some(a) | none | some(a) |
| none | some(a) | some(a) |
| some(a) | some(b)  | some(b)|

```js
import { getLastMonoid, some, none } from 'fp-ts/Option'

const M = getLastMonoid<number>()

M.concat(some(1), none) // some(1)
M.concat(some(1), some(2)) // some(2)
```

As an example, getLastMonoid can be useful for managing optional values

```js
import { Monoid, getStructMonoid } from 'fp-ts/Monoid'
import { Option, some, none, getLastMonoid } from 'fp-ts/Option'

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  fontFamily: Option<string>
  /** Controls the font size in pixels */
  fontSize: Option<number>
  /** Limit the width of the minimap to render at most a certain number of columns. */
  maxColumn: Option<number>
}

const monoidSettings: Monoid<Settings> = getStructMonoid({
  fontFamily: getLastMonoid<string>(),
  fontSize: getLastMonoid<number>(),
  maxColumn: getLastMonoid<number>()
})

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80)
}

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none
}

/** userSettings overrides workspaceSettings */
monoidSettings.concat(workspaceSettings, userSettings)
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```
