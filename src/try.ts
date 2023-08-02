import {Maybe} from 'true-myth';
import { just } from 'true-myth/dist/es/maybe';
import { Result } from 'true-myth';
const { ok, err } = Result;

const myNumber = ok<number, string>(12);
const myNumberErr = err<number, string>('oh no');

console.log('myNumber', myNumber.map((n) => n * 2)) ; // Ok(24)
console.log('myNumberErr', myNumberErr.map((n) => n * 2)); // Err(oh no)

const myInteger = Maybe.of(4);
const a = myInteger.map((x) => x * 3); //
const val = a.unwrapOr('error')
console.log('map ',val )
const printr = (x:Maybe<number>) => console.log('printr ', x.unwrapOr('not value'))
printr(a)
const op = a.map(x=> x + 2)
op.isJust && console.log('op ', op.unwrapOr('error'))
// const dd = a.map(just(printr))
// console.log('myInteger2',dd.unwrapOr('not value'))