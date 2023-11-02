# Algebral Data Type ADT

## from

<https://dev.to/goodpic/algebraic-data-types-with-typescript-15j7#:~:text=Algebraic%20Data%20Types%20(ADTs)%20are,operator)%2C%20and%20discriminated%20unions>.

```ts
type Alien = { type: 'unknown'; }
type Animal = { species: string; type: 'animal'; }
type Human = Omit<Animal, 'type'> & { name: string; type: 'human'; }
type User = Animal | Human;
```

here type is use for discriminated

A ***discriminated union*** in TypeScript is a way to create a type that combines union types and has a common property that can be used to determine the specific type of the variable at runtime. In the example above, type: 'animal' or 'human' is the common property.

### Pattern matching and exhaustiveness checks:

When working with ADTs, especially sum types (discriminated unions), you can leverage TypeScript's ability to perform pattern matching and exhaustiveness checks. These checks help ensure that you've handled all possible cases when working with a value, reducing the chances of bugs due to unhandled cases.

### Encapsulation of logic:

ADTs can help you encapsulate the logic related to specific data structures, such as validation or transformation, making your code more modular and easier to reason about.

```ts
type Human = Omit<Animal, 'type'> & {
  name: string;
  type: 'human';
}
```

***Omit*** : This is a utility type that creates a new type by removing the specified keys.

### Difference between extends and & intersection

It is possible to write the similar data structure by using interface with extends.

```ts
interface Animal {
  species: string;
  type: 'animal';
}

interface Human extends Omit<Animal, 'type'> {
  name: string;
  type: 'human';
}
```

The interface keyword is primarily used for defining object types, while the type keyword is used for defining any type, including object types, union types, and intersection types.

One key difference between using extends and & is that :

- extends creates a new type that has an inheritance relationship with the parent type.
- & creates a new type that is a combination of two or more existing types without any inheritance relationship.

It is a personal preference, but type could be more flexible when you have to describe a lot of intersections.

### How to predict unknown data

Suppose we have the following un-typed data, how can we let TypeScript compile to allocate them to the proper types?

```ts
const ghost: unknown = null;
const alien: unknown = {}
const sheep: unknown = { species: 'sheep', }
const jun: unknown = { name: 'Jun', species: 'human', }
const anomany: unknown = { name: 'anomany', }
```

### User-defined type guards

User-defined type guards are a feature in TypeScript that allows you to create custom type-checking functions that can narrow down the type of a value within a specific scope.

- Takes a value as a parameter, which is usually of a more general type, such as unknown or a union type.
- Returns a boolean value, which indicates whether the value matches the expected type.
- Uses a special ***type predicate*** in the return type annotation, in the format ***"value is SpecificType"***, "someone is Animal", "someone is Human" and "data is { [key: string]: unknown }" are the type predicates

```ts
type Predicate = data is { [key: string]: unknown }
function hasProperty(data: unknown): data is { [key: string]: unknown } {
  return data != null;
}

function isAnimal(someone: unknown): someone is Animal {
  return hasProperty(someone) && typeof someone.species === 'string'
}

function isHuman(someone: unknown): someone is Human {
  return hasProperty(someone)
  && typeof someone.name === 'string'
  && someone.species === 'human';
}
```

