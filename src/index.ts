import { compose, map, filter } from "./fp-lib";
export { Nothing } from "./monad";

const { Just } = Maybe;

const result = compose(
  map((x: number) => x * 2),
  filter((x) => x > 2)
)([1, 2, 3, 4]);

console.log("sss", result);

console.log("sss ddd");
