typeclass

<https://paulgray.net/typeclasses-in-typescript/>

### Interface vs. Type

Typescript has both interface and type aliases but they can often be used incorrectly. One of the key differences between the two of these is that an Interface is limited to describing Object structures whereas type can consist of Objects, primitives, union types, etc.

Another difference here is their intended use. An interface primarily describes how something should be implemented and should be used. A type on the other hand is a definition of a type of data.

```js
// union type of two species
type CatSpecies = 'lion' | 'tabby';

// interface defining cat shape and using the above type
interface CatInterface {
   species: CatSpecies;
   speak(): string;
}

class Cat implements CatInterface {
   constructor(public species: CatSpecies) { }
   speak() {
      return this.species === 'lion' ? 'ROAR' : 'meeeooow';
   }
}

const lion = new Cat("lion");
console.log(lion.speak());
// ROAR
```

One benefit of types is you can use computed properties via the in keyword. This programmatically generates mapped types. You can take this example further and combine it with the use of a generic to define a type that requires the keys of the generic passed in to be specified.

```js
type FruitColours<T> = { [P in keyof T]: string[] };

const fruitCodes = {
   apple: 11123,
   pear: 33343,
   banana: 33323
} as const; // as const give it immutablie

// This object must include all the keys present in fruitCodes.
// If you used this type again and passed a different generic
// then different keys would be required.
const fruitColours: FruitColours< typeof fruitCodes > = {
   apple: ['red', 'green'],
   banana: ['yellow'],
   pear: ['green']
};
```