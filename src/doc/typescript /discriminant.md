# Discriminant Union

<https://dev.to/darkmavis1980/what-are-typescript-discriminated-unions-5hbb#:~:text=A%20discriminated%20union%20is%20a,handle%20all%20possible%20cases%20gracefully>.

```ts
type Vehicle = {
  make: string;
  model: string;
  fuel: "petrol" | "diesel";
} & (Car | MotorBike);

type MotorBike = {
  type: "motorbike";
  fuel: "petrol";
};

type Car = {
  type: "car";
  doors: number;
  bootSize: number;
};

// This is valid
const myBike: Vehicle = {
  type: "motorbike",
  make: "honda",
  model: "cbr",
  fuel: "petrol",
};

// This is also valid
const myCar: Vehicle = {
  make: "vw",
  model: "golf",
  fuel: "diesel",
  type: "car",
  bootSize: 400,
  doors: 5,
};

// This will throw a TS error
const myBike1: Vehicle = {
  // <- myCar will show an error
  make: "vw",
  model: "golf",
  fuel: "diesel", // error: the fuel type is discriminant
  type: "motorbike",
};

// This will also throw a TS Error as doors doesn't exists on that type
const myBike2: Vehicle = {
  type: "motorbike",
  make: "honda",
  model: "cbr",
  fuel: "petrol",
  doors: 5, // <-- will error here
};

// woth discriminant union we must handle with condition 
const vehicleHandler = (vehicle: Vehicle) => {
  switch (vehicle.type) {
    case 'car':
      console.log(`The car has ${vehicle.doors} doors`); 
      break;
    case 'motorbike':
      console.log(`The only fuel my motorbike can take is ${vehicle.fuel}`);
      break;
  }
}
```
