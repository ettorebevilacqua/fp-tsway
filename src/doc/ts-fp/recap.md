### fold

## Folding

By definition concat works with only two elements of A, what if we want to concat more elements?

The fold function takes a semigroup instance, an initial value and an array of elements:

```js
import { fold, semigroupSum, semigroupProduct } from 'fp-ts/Semigroup'

// const semigroupSum: Semigroup<number> = {concat: (x, y) => x + y}

const sum = fold(semigroupSum)
sum(0, [1, 2, 3, 4]) // 10

const product = fold(semigroupProduct)
product(1, [1, 2, 3, 4]) // 24
```

### Type Constructors and Kinds

List is an example of a type constructor. Values do not have the type List directly, but rather List a for some type a. That is, List takes a type argument a *** and constructs a new type List a.***

Note that just like function application, ***type constructors are applied to other types*** simply by juxtaposition: the type List Entry is, in fact, the type constructor List applied to the type Entry – it represents a list of entries.

```ts
// List is type constructor for type Entry
type List Entry
```

If we try to incorrectly define a value of type List (by using the type annotation operator ::), we will see a new type of error:

> import Data.List
> Nil :: List

this get this error :
In a type-annotated expression x :: t, the type t must have kind Type

kind = tipo , genere, specie, sorta

This is a kind error. Just like values are distinguished by their types, ***types are distinguished by their kinds***, and just like ill-typed values result in type errors, ill-kinded types result in kind errors.

***come i valori hanno il tipo, il tipo ha il suo genere o tipo del tipo detto kind***

There is a special kind called Type which represents the kind of all types which have values, like Number and String.

There are also kinds for type constructors. For example, the kind Type -> Type represents a function from types to types, just like List. So the error here occurred because values are expected to have types with kind Type, but List has kind Type -> Type.

***in haskell the kind Type -> Type is * -> ****

To find out the kind of a type, use the :kind command in PSCi. For example:

```text

> :kind Number
Type

> import Data.List
> :kind List
Type -> Type

> :kind List String
Type
```

## Algebraic Data Types

Algebraic Data Types (ADTs) are concepts originally from functional programming languages, representing composite types formed by combining other types. In TypeScript, ADTs can be achieved using union types ("|" operator), intersection types ("&" operator), and discriminated unions.

```ts
type Alien = { type: 'unknown';}
type Animal = { species: string; type: 'animal'; }

type Human = Omit<Animal, 'type'> & {
  name: string;
  type: 'human';
}

type User = Animal | Human;

```

Operator
    union types  = |
    intersection types = &

### discriminant type

// A discriminated type union is where you use code flow
// analysis to reduce a set of potential objects down to one
// specific object.

https://www.typescriptlang.org/play?#code/PTAEEFQEwSwZwMYCcYFsYDsCGAXAplKDgJ4AOeoArhjAPYajygDuAFnkhcbZVXBQlpQKAMwA2tZgCgQoLNjHE4THLVCcolBBSyh+OULRGhStfBhwwsYwwCMAVngQ440SQ1WGMeGWDjkEGBEYBDtHZwA6X19QABVWJlJcfCQGZlokAGtXTmtFFjwxGxEMvTwXQ2NldDEsJBjaBycK5hgcVjloIJEOPAs9HBQMAHNDJFAMSlRbDlBBDDgceRwYkvG8AA8sVFIxPAAuTrF4AyMJ7YJQPAA3PpcAGjHQW6RlegIY-VczxvCXKKkJHIcTQmGGAFFbv0ALygADe51QB1AACJFnUcCiANx8DgAZSWSHwUEOtlotD28lAAF9QAAfeGI5EohASfhQbHQShIXB0DCHSbTWbUrFSGIAdXYDBudzmtCRrkwnnaTBE1GcfMebTllDEhBmcgwxAaxnaFBw6RMZjuVhsQLwcAB80WoFY8ige0hsthAAoZRZDrFQSMvRYAJSgaEAPnhUlAoFkACFiHwwZ04K0cAgOlhhlhMC7-TgItgkXEyHg8cgYKQcAByVyCYRxhNgcSSQ3WJRMBBU4QpdDeIhugxU37NOZjjCKFuyA2cUicfgWS62FPvIgVxgedhUGj0AHxjNtbOgP1Q4ulvARuEt+O9-io9FElH7O-x1txBKuJHyVzcXhewYOAsB6fIsAQbQ4FcSh+CQAkMQ+D8PznJwsFgig2gbYcKHofJ7W3ZRhBBQcIQvd941kNheiZRhXDRQlMQouUFgMTA2isYlkwAVTgyMrgvCIMPgxiCFFZD41sXJMlFd8HwoFk2QIV9mOdAxLAVJIGFhIsIk0HlLHocSJKkvAsBkltqSkEUxVkeJEmSDgGBUXcQLLTMOkFGZXhYBJT2YAQqQwmIsFcM0ukQFBB1wDIAVkABJHcmE2bZdjwR4AtdLBbk6WBIuDXAKGoPlDUIeQQqgWBDIUK4kCQUp0XwIg1DdDAPTwAECPAAAFeKACUHVMBYHX4hEXjeflQAABhxVA4GGQ5FiGUZaQZMaOAmw4AEZZodEDhmRJawRxRrYIFKZvJpelGQ4eqkEWwY0xsqQ1Kytq9gG-x6EfX0lyG-hDh6-rBu+h0I2jWNKLAAAJd09hw2q7snfhHndHCGE4HBuQwFsgjPFFboyFFt3UEHhpvOTvopDrCaQH0-tBiJabDYz40x7HjKs2cwFiCsqxQWsJg7TIMEkMKRwgXrPv+wKMFFgwZm5hHac3cgIlAeLjG1ALOGVuqMkecK1QwDV6CV9JdUIN0cvZ1ICHVgBNHhJwYF4ghTFVXDXJXWFoN2RkMF5Sa+4bQBmCRmEPRhjHpsn+AicaSuhZPpop5DnWpiIJGGWOQ-jubhhZyyrjER88dzmWE42pOU62tOPwzvYs9oHOGeGiJTrgR42-zvbc2vTnrNk2QncoOtdZmHAUkqYxYLTXRjyzDpGrwJF+gLfAsEIIwYjxle14qGZeww0AAJd0BUHMnRoO5eQoOHXA5CKGIkiJb5TV3Yr6DkXXsycTJ7ZfhokwXQwxySECSFPJyqxSie1TAHcK3gg4EUwAjVqUAyS0EyG+GIrAp6kDgPsEAzASERHtPlWstQRgRAyMMYAUBaAIDgMAdBmDMjAC3tcO+BAAC05CIh4NQGIAAxHlas0ViQ8K-gsKQQA