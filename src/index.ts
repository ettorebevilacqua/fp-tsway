import { compose, map, filter } from "./fp-lib";
import {  Maybe }  from './monad'

// const {  Maybe} = monad  export  * from 'true-myth's
                                                                                                                              
 const { just, nothing } = Maybe
const a = just(6)
const result = compose(
  map((x: number) => x * 2),
  filter((x) => x > 2)
)([1, 2, 3, 4]);

console.log("sss", result);

console.log("sss ddd");
