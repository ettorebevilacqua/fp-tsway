### Semigroup

https://rlee.dev/practical-guide-to-fp-ts-part-4

A Semigroup is a type that is able to take two homogenous values and produce a single homogenous value with concat function.

```js
export interface Semigroup<A> {
  readonly concat: (x: A, y: A) => A
}
```

we can concat with one value
```
const onlyOne: Semigroup<number> = {
  concat: (_, _) => 1,
}

find mmax 
```
const semigroupMax: Semigroup<number> = {
  concat: (x, y) => Math.max(x, y),
}

more coincise
```
const semigroupMax: Semigroup<number> = {
  concat: Math.max,
}
```

The function takes two elements. What happens if our input array is empty?

### MONOID is semogroup that implement empity

Monoids are an extension of Semigroup but it also includes the empty or default element.

```js
export interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}
```

If you go back to the reduce functions we wrote previously, we specified 0 as the empty element for addition and Number.NEGATIVE_INFINITY for Math.max. We would plug in the same values for a monoid.

```js
import { Monoid } from 'fp-ts/lib/Monoid'
const monoidMax: Monoid<number> = {
  concat: semigroupMax.concat,
  empty: Number.NEGATIVE_INFINITY,
}
```

Now we can replace our reduce functions with foldMap functions alleviating the responsibility of the reduction to the monoid.[^2]

```js
import { Monoid, monoidSum } from 'fp-ts/lib/Monoid'

const compute = (arr: Array<Foo | Bar>) =>
  pipe(
    A.array.partitionMap(arr, (a) =>
      a._tag === 'Foo' ? E.left(a) : E.right(a),
    ),
    ({ left: foos, right: bars }) => {
      const sum = A.array.foldMap(monoidSum)(foos, (foo) => foo.f())
      const max = A.array.foldMap(monoidMax)(bars, (bar) => bar.g())

      return sum * max
    },
  )
```

```js
const compute = (fooMonoid: Monoid<number>, barMonoid: Monoid<number>) => (
  arr: Array<Foo | Bar>,
) =>
  pipe(
    A.array.partitionMap(arr, (a) =>
      a._tag === 'Foo' ? E.left(a) : E.right(a),
    ),
    ({ left: foos, right: bars }) => {
      const sum = A.array.foldMap(fooMonoid)(foos, (foo) => foo.f())
      const max = A.array.foldMap(barMonoid)(bars, (bar) => bar.g())

      return sum * max
    },
  )

declare const i: number
if (i % 2 === 0) {
  compute(monoidSum, monoidMax)
} else {
  compute(monoidMax, monoidSum)
}
```

```js
```

```js
```

```js
```