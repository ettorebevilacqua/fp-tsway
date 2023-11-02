### EQ

```js
interface Eq<A> {
  /** returns `true` if `x` is equal to `y` */
  readonly equals: (x: A, y: A) => boolean
}
```

As an example here's the instance of Eq for the type number

```js
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
function elem<A>(E: Eq<A>): (a: A, as: Array<A>) =>
   (a, as) => as.some(item => E.equals(item, a))

elem(eqNumber)(1, [1, 2, 3]) // true
elem(eqNumber)(4, [1, 2, 3]) // false
```

```js
type Point = {
  x: number
  y: number
}

const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1.x === p2.x && p1.y === p2.y
}

// We can even try to optimize equals by first checking reference equality

const eqPoint: Eq<Point> = {
  equals: (p1, p2) => p1 === p2 || (p1.x === p2.x && p1.y === p2.y)
}
```

This is mostly boilerplate though. The good news is that we can build an Eq instance for a struct like Point if we can provide an Eq instance for each field.

Indeed the fp-ts/Eq module exports a getStructEq combinator:

```js
```

```js
```

```js
```

```js
```

```js
```

```js
```
