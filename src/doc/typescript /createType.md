# Creating Types from Types

<https://www.typescriptlang.org/docs/handbook/2/types-from-types.html>

<https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated->

## operators

### keyof type operators

The keyof operator takes an object type and produces a string or numeric literal union of its keys. The following type P is the same type as type P = "x" | "y":

```ts
type Point = { x: number; y: number };
type P = keyof Point;
```

If the type has a string or number index signature, keyof will return those types instead:

```ts
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish; //  A = number
type Mapish = { [k: string]: boolean };
type M = keyof Mapish; //  M = string | number
```

Note that in this example, M is string | number — this is because JavaScript object keys are always coerced to a string, so obj[0] is always the same as obj["0"].

### typeof type operator

```ts
let s = "hello";
let n: typeof s; // n: string
```

### ReturnType

```ts
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>; // K = boolean

// If we try to use ReturnType on a function name, we see an instructive error:

function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<f>;
// error :  'f' refers to a value, but is being used as a type here. Did you mean 'typeof f'?
```

Remember that values and types aren’t the same thing. To refer to the type that the value f has, we use typeof:

```ts
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>; // P = { x: number; y: number; }
```

**_Limitations_**

TypeScript intentionally limits the sorts of expressions you can use typeof on.

Specifically, it’s only legal to use typeof on identifiers (i.e. variable names) or their properties. This helps avoid the confusing trap of writing code you think is executing, but isn’t:

```ts
// Meant to use = ReturnType<typeof msgbox>
let shouldContinue: typeof msgbox("Are you sure you want to continue?");
// error : ',' expected.
```

### Indexed Access Types

We can use an indexed access type to look up a specific property on another type:

```ts
type Person = { age: number; name: string; alive: boolean };
type Age = Person["age"]; //  Age = number
```

The indexing type is itself a type, so we can use unions, keyof, or other types entirely:

```ts
type I1 = Person["age" | "name"]; // I1 = string | number
type I2 = Person[keyof Person];   // I2 = string | number | boolean
type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName]; // I3 = string | boolean
```

You’ll even see an error if you try to index a property that doesn’t exist:

```ts
type I1 = Person["alve"];
// error : Property 'alve' does not exist on type 'Person'.
```

Another example of indexing with an arbitrary type is using number to get the type of an array’s elements. We can combine this with typeof to conveniently capture the element type of an array literal:

```ts
const MyArray = [
{ name: "Alice", age: 15 },
{ name: "Bob", age: 23 },
{ name: "Eve", age: 38 },
];

type Person = typeof MyArray[number];

type Person = { name: string; age: number; }
type Age = typeof MyArray[number]["age"]; // Age = number
// Or
type Age2 = Person["age"]; // Age2 = number
```

You can only use types when indexing, meaning you can’t use a const to make a variable reference:

```ts
const key = "age";
type Age = Person[key];
// Type 'key' cannot be used as an index type.
// 'key' refers to a value, but is being used as a type here. Did you mean 'typeof key'?
```

However, you can use a type alias for a similar style of refactor:

```ts
type key = "age";
type Age = Person[key];
```
