### Mapped Types in TypeScript

<https://www.typescriptlang.org/docs/handbook/2/mapped-types.html>


The entries method returns an array of tuples, each containing a property key and the corresponding value. There are plenty of square brackets involved in the return type, admittedly, but there's the type safety we've been looking for!

Let's now see how Object.freeze() is typed within the lib.d.ts file that ships with TypeScript:

Object.freeze() make readonly all key of abject

definition

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

More Examples for Mapped Types
We've seen the Readonly<T> type that is built into the lib.d.ts file. In addition, TypeScript defines additional mapped types that can be useful in various situations. Some examples:

```typescript
/**
 * Make all properties in T optional
 */
type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * From T pick a set of properties K
 */
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Construct a type with a set of properties K of type T
 */
type Record<K extends string, T> = {
  [P in K]: T;
};
```

And here are two more examples for mapped types that you could write yourself if you have the need for them:

```typescript
/**
 * Make all properties in T nullable
 */
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Turn all properties of T into strings
 */
type Stringify<T> = {
  [P in keyof T]: string;
};
You can have fun with mapped types and combine their effects:

type X = Readonly<Nullable<Stringify<Point>>>;
// type X = {
//     readonly x: string | null;
//     readonly y: string | null;
// };
```

example use Partial :

React: A component's setState method allows you to update either the entire state or only a subset of it. You can update as many properties as you like, which makes the setState method a great use case for Partial<T>.


### Conditional Types

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

The NonNullable<T> type selects the never type if the type T is assignable to either the type null or the type undefined; otherwise it keeps the type T. The never type is TypeScript's bottom type, the type for values that never occur.

```typescript
type EmailAddress = string | string[] | null | undefined;
```

Let's now apply the NonNullable<T> type to EmailAddress and resolve the resulting type step by step:

```typescript
type NonNullableEmailAddress = NonNullable<EmailAddress>;
```

We'll start by replacing EmailAddress by the union type that it aliases:

```typescript
type NonNullableEmailAddress = NonNullable<
  string | string[] | null | undefined
>;
```

Here's where the distributive nature of conditional types comes into play. We're applying the NonNullable<T> type to a union type; this is equivalent to applying the conditional type to all types in the union type:

```typescript
type NonNullableEmailAddress =
  | NonNullable<string>
  | NonNullable<string[]>
  | NonNullable<null>
  | NonNullable<undefined>;
```

We can now replace NonNullable<T> by its definition everywhere:

```typescript
type NonNullableEmailAddress =
  | (string extends null | undefined ? never : string)
  | (string[] extends null | undefined ? never : string[])
  | (null extends null | undefined ? never : null)
  | (undefined extends null | undefined ? never : undefined);
```

Next, we'll have to resolve each of the four conditional types. Neither string nor string[] are assignable to null | undefined, which is why the first two types select string and string[]. Both null and undefined are assignable to null | undefined, which is why both the last two types select never:

type NonNullableEmailAddress = string | string[] | never | never;
Because never is a subtype of every type, we can omit it from the union type. This leaves us with the final result:

```typescript
type NonNullableEmailAddress = string | string[];
```

And that's indeed what we would expect our type to be!

### Mapped Types with Conditional Types

<https://codesandbox.io/s/fp-ts-react-o5t7m?file=/src/index.tsxs>

type NonNullablePropertyKeys<T> = {
  [P in keyof T]: null extends T[P] ? never : P;
}[keyof T];