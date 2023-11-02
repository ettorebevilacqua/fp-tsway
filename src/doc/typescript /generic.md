### generic

<https://www.typescriptlang.org/docs/handbook/2/generics.html>

```ts
function loggingIdentity<Type>(arg: Type[]): Type[];
// is the same like this :
function loggingIdentity<Type>(arg: Array<Type>): Array<Type> {}

function identity<Type>(arg: Type): Type {
  return arg;
}

let output = identity<string>("myString");
// output is = let output: string
// with type argument inference
let output = identity("myString");
// output is = let output: string

let myIdentity: <Input>(arg: Input) => Input = identity;
// We can also write the generic type as a call signature of an object literal type:
let myIdentity: { <Type>(arg: Type): Type } = identity;
```

Which leads us to writing our first generic interface. Let’s take the object literal from the previous example and move it to an interface:

```ts
interface GenericIdentityFn { <Type>(arg: Type): Type; }

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn = identity;

// This makes the type parameter visible to all the other members of the interface.

interface GenericIdentityFn<Type> { (arg: Type): Type;}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

### Generic Constraints

```ts
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
// give this error : Property 'length' does not exist on type 'Type'.
  return arg;
}
```

```ts
interface Lengthwise {
  length: number;
}

// we’ll create an interface that describes our constraint.

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // Now we know it has a .length property, so no more error
  return arg;
}
```

### Using Type Parameters in Generic Constraints

You can declare a type parameter that is constrained by another type parameter.

```ts
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
Argument of type '"m"' is not assignable to parameter of type '"a" | "b" | "c" | "d"'.
```

### Generic Parameter Defaults

```ts
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

we can create an html element, with no argument we create an HTMLDivElement, with an argument generate an element of T type, or call wih his children

***A generic parameter default follows the following rules:***

A type parameter is deemed optional if it has a default.

Required type parameters must not follow optional type parameters.
Default types for a type parameter must satisfy the constraint for the type parameter, if it exists.

When specifying type arguments, you are only required to specify type arguments for the required type parameters. Unspecified type parameters will resolve to their default types.

If a default type is specified and inference cannot choose a candidate, the default type is inferred.

A class or interface declaration that merges with an existing class or interface declaration may introduce a default for an existing type parameter.
A class or interface declaration that merges with an existing class or interface declaration may introduce a new type parameter as long as it specifies a default.