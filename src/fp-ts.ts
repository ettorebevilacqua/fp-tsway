import { pipe } from "fp-ts/function";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/State";
import swich from 'swich';

type State = "UNPAIED" | "PAID"
 type Gumball = "Gumball" | "Coin";
 type Output2 = O.Option<Gumball>;
//state transition functions are of the type State -> (Output, State)

type StatePayKey = "UNPAIED" | "PAID" // keyof typeof StatePayDef
type TurnStateKey = "GUM" | "COIN"
type OpStatePay = O.Option<TurnStateKey>;

const statePay= [O.none, "UNPAIED"] // O.some("UNPAIED")

const pay = (amount: number): S.State<StatePayKey, OpStatePay> => (state:StatePayKey) => {
    return swich<number, [OpStatePay, StatePayKey]>([
        [50, [O.none, "PAID"]],
        [ [O.none, state] ]
      ])(amount);
  };
  const aaa2 = pay(19)("PAID")

  const turn =  (turn: TurnStateKey): S.State<StatePayKey, OpStatePay> => (state: StatePayKey) => {
    return swich<StatePayKey, [OpStatePay, StatePayKey]> ([
        ["UNPAIED", [O.none, state]],
        ["PAID", [O.some(turn), "UNPAIED"]]
    ])(state)
  };

//Single usage:
const sCoin50 = pay(50)("UNPAIED"); // [O.none, "Paid"];
console.log('ss', sCoin50)
const turnRes = turn("GUM")(sCoin50[1]); // [O.some("Gumball"), "Unpaid"]
console.log('ss2',turnRes)


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
