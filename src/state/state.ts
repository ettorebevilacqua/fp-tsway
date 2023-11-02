import { pipe } from "fp-ts/function";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/State";
import swich from 'swich';

type StatePayKey = "UNPAIED" | "PAID" | "OFF" // keyof typeof StatePayDef
type TurnStateKey =  "GUM" | "COIN"
type TurnState = {
    turn: TurnStateKey
    amount: number
}
type OpStatePay = O.Option<TurnState>;
type OptionState = S.State<StatePayKey, OpStatePay>
type StateFlag = [OpStatePay, StatePayKey]
const log = <T>(msg: string, val: T): T => (console.log(msg, val), val)
//state transition functions are of the type State -> (Output, State)
const pay = (amount: number): OptionState => (state: StatePayKey) =>
    swich<number, StateFlag>([
        [50, state === "OFF" ? [O.some({turn: "COIN", amount }), "OFF"] : [O.none, "PAID"]],
        [val=>val!==50, [O.some({turn: "COIN", amount }), state] ],
        [[O.none, state]]
    ])(amount)

const turn = (turn: TurnStateKey): OptionState => (state: StatePayKey) =>
    swich<StatePayKey, StateFlag>([
        ["UNPAIED", [O.none, state]],
        ["PAID", [O.some({turn, amount:1}), "UNPAIED"]],
        [[O.none, state]]
    ])(state)

 // const sCoin50 = pay(50)("UNPAIED"); // [O.none, "Paid"]; console.log('ss', sCoin50);
// const turnRes = turn("GUM")(sCoin50[1]); // [O.some("Gumball"), "Unpaid"] // console.log('ss2',turnRes)

// console.log( turn("GUM")( pay(50)("UNPAIED")[1] )); chaun versuin
// i valori si trovano dentro il box state, chain, o flat
 console.log('chain', S.chain(() => turn("GUM"))(pay(5))("UNPAIED"));

const turnGum = turn("GUM")
const actions = [pay(5), turnGum, pay(50), turnGum, turnGum, pay(50), turnGum, pay(50), turn("COIN"), pay(50)];
const [outputs, finalState] = S.sequenceArray(actions)('UNPAIED');
const numGumballs = outputs.filter(val => O.isSome(val) && val.value.turn === "GUM").length; //2
console.log('numGumballs ', numGumballs)
console.log('actions ', outputs, finalState)
// but how do we build a state machine out of these individual parts?
// Monads!

// (>>=) :: (Monad m) => m a -> (a -> m b) -> m b
// Monad (State s)
// (>>=) :: (State s) => State s a -> (a -> State s b) -> State s b
//chain: <E, A, B>(f: (a: A) => State<E, B>) => (ma: State<E, A>) => State<E, B>

// (>>=) :: (Monad m) => m a -> (a -> m b) -> m b
// Monad (State s)
// (>>=) :: (State s) => State s a -> (a -> State s b) -> State s b

//State s a :: s -> (a,s)
//a - > State s b :: a -> s -> (b, s)
//State s b :: s -> (b, s)
