# Monad

In the last post we saw that we can compose an effectful program f: (a: A) => M<B> with a pure n-ary program g by lifting g, provided that M admits an applicative functor instance

|  Program f  |  Program g  |  Composition  |
|----------|:-------------:|------:|
| pure |  pure | g ∘ f |
| CC | pure, n-ary | liftAn(g) ∘ f |

where liftA1 = lift
However we must solve one last case: what if both programs are effectful?

* f: (a: A) => M<B>
* g: (b: B) => M<C>

What's the "composition" of such f and g?

In order to handle this last case we need something more powerful than Functor since it's quite easy to end up with nested contexts.

## Currying

First of all we must model a function that accepts two arguments, let's say of type B and C (we can use a tuple) and returns a value of type D
g: (args: [B, C]) => D
We can rewrite g using a technique called currying.

Currying is the technique of translating the evaluation of a function that takes multiple arguments into evaluating a sequence of functions, each with a single argument. For example, a function that takes two arguments, one from B and one from C, and produces outputs in D, by currying is translated into a function that takes a single argument from C and produces as outputs functions from B to C.

(source: currying on wikipedia.org)

So we can rewrite g to
>g: (b: B) => (c: C) => D

What we want is a lifting operation, let't call it liftA2 in order to distinguish it from our old lift, that outputs a function with the following signature
>liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>

How can we get there? Since g is now unary, we can use the functor instance and our old lift
>lift(g): (fb: F<B>) => F<(c: C) => D>

But now we are stuck: there's no legal operation on the functor instance which is able to unpack the value F<(c: C) => D> to a function (fc: F<C>) => F<D>.

## Apply

So let's introduce a new abstraction Apply that owns such a unpacking operation (named ap)

```js
interface Apply<F> extends Functor<F> {
  ap: <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>
}
```

The ap function is basically unpack with the arguments rearranged

```js
unpack: <C, D>(fcd: HKT<F, (c: C) => D>) => ((fc: HKT<F, C>) => HKT<F, D>)
ap:     <C, D>(fcd: HKT<F, (c: C) => D>, fc: HKT<F, C>) => HKT<F, D>
```

so ap can be derived from unpack (and viceversa).

Note: the HKT type is the fp-ts way to represent a generic type constructor (a technique proposed in the Lightweight higher-kinded polymorphism paper) so when you see HKT<F, X> you can think to the type constructor F applied to the type X (i.e. F<X>).

## Applicative

Moreover it would be handy if there exists an operation which is able to lift a value of type A to a value of type F<A>. This way we could call the liftA2(g) function either by providing arguments of type F<B> and F<C> or by lifting values of type B and C.

So let's introduce the Applicative abstraction which builds upon Apply and owns such operation (named of)

```js
interface Applicative<F> extends Apply<F> {
  of: <A>(a: A) => HKT<F, A>
}
```

Let's see the Applicative instances for some common data types

```js
// Example (F = Array)

import { flatten } from 'fp-ts/Array'

const applicativeArray = {
  map: <A, B>(fa: Array<A>, f: (a: A) => B): Array<B> => fa.map(f),
  of: <A>(a: A): Array<A> => [a],
  ap: <A, B>(fab: Array<(a: A) => B>, fa: Array<A>): Array<B> =>
    flatten(fab.map(f => fa.map(f)))
}

// Example (F = Option)

import { Option, some, none, isNone } from 'fp-ts/Option'

const applicativeOption = {
  map: <A, B>(fa: Option<A>, f: (a: A) => B): Option<B> =>
    isNone(fa) ? none : some(f(fa.value)),
  of: <A>(a: A): Option<A> => some(a),
  ap: <A, B>(fab: Option<(a: A) => B>, fa: Option<A>): Option<B> =>
    isNone(fab) ? none : applicativeOption.map(fa, fab.value)
}

// Example (F = Task)

import { Task } from 'fp-ts/Task'

const applicativeTask = {
  map: <A, B>(fa: Task<A>, f: (a: A) => B): Task<B> => () => fa().then(f),
  of: <A>(a: A): Task<A> => () => Promise.resolve(a),
  ap: <A, B>(fab: Task<(a: A) => B>, fa: Task<A>): Task<B> => () =>
    Promise.all([fab(), fa()]).then(([f, a]) => f(a))
}
```

## Lifting

So given an instance of Apply for F can we now write liftA2?

```js
import { HKT } from 'fp-ts/HKT'
import { Apply } from 'fp-ts/Apply'

type Curried2<B, C, D> = (b: B) => (c: C) => D

function liftA2<F>(
  F: Apply<F>
): <B, C, D>(g: Curried2<B, C, D>) => Curried2<HKT<F, B>, HKT<F, C>, HKT<F, D>> {
  return g => fb => fc => F.ap(F.map(fb, g), fc)
}
```

Nice! But what about functions with three arguments? Do we need yet another abstraction?
The good news is that the answer is no, Apply is enough

```js
type Curried3<B, C, D, E> = (b: B) => (c: C) => (d: D) => E

function liftA3<F>(
  F: Apply<F>
): <B, C, D, E>(
  g: Curried3<B, C, D, E>
) => Curried3<HKT<F, B>, HKT<F, C>, HKT<F, D>, HKT<F, E>> {
  return g => fb => fc => fd => F.ap(F.ap(F.map(fb, g), fc), fd)
}
```

Actually given an instance of Apply we can write a liftAn function, for each n.
Note. liftA1 is just lift, the Functor operation.

We can now update our "composition table"

|  Program f  |  Program g  |  Composition  |
|----------|:-------------:|------:|
| pure |  pure | g ∘ f |
| effectful | pure, n-ary | liftAn(g) ∘ f |

