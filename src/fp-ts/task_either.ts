/*
Every asynchronous operation in modern Typescript is done using a Promise object.
A task is a function that returns a promise which is expected to never be rejected.

in case of error, the error is thrown and breaks the functional pipeline.
without putting a try-catch-finally block in front. Test your assumptions before using Task.
*/

import * as T from "fp-ts/lib/Task"
import * as E from "fp-ts/lib/Either"
import { flow, pipe } from "fp-ts/lib/function"
import * as TE from 'fp-ts/lib/TaskEither'

// different define for task

interface Task1<A> { (): Promise<A> }
type Task2<A> = () => Promise<A>

// function that can fail 
async function someTask(id: string) {
    if (id.length > 36) {
        throw new Error('id must have length less than or equal to 36')
    }
    // do async work here
}

const id = 'abc' // here someTask not fail, but with another value can it
const task: T.Task<void> = () => someTask(id)

// Handled Failures Can't Fail

async function asyncFunction() {
    return await Promise.resolve(10) //throw new Error("Function not implemented.")
}

async function boolTask1(): Promise<boolean> {
    try {
        await asyncFunction()
        return true
    } catch (err) { return false }
}
// By definition, this function already implements the Task interface, but because the return type is a Promise, 
// the result is still ambiguous to the client. We can remove the ambiguity by adjusting the syntax.
// we change  Promise<boolean>  with async ()
const boolTask2: T.Task<boolean> = async () => {
    try {
        await asyncFunction()
        return true
    } catch (err) { return false }
}

// TASK Constructors
// Any arbitrary value can become a Task by using the of operator to lift it into the Task world. This is equivalent to calling Promise.resolve.

const foo = 'asdf' // string
const bar = T.of(foo) // T.Task<string>

// Same As
const fdsa: T.Task<string> = () => Promise.resolve(foo)
const aaa = bar() // aaa promise<string>, fdsa return promise<string>

// Either **************************

// Eithers are also advantageous to their try-catch-finally counterparts because the error is always type-safe.
// When you use a catch block, the error is always of type unknown.

type Either<E, A> = Left<E> | Right<A>

interface Left<E> {
    readonly _tag: 'Left'
    readonly left: E
}

interface Right<A> {
    readonly _tag: 'Right'
    readonly right: A
}

// chainW ******************

interface Password {
    _tag: 'Password'
    value: string
    isHashed: boolean
}

type HashFn = (value: string) => E.Either<Error, string>

const passwordOf = (value: string): Password => ({ _tag: 'Password', value, isHashed: false })
const fromHashed = (hashFn: HashFn) => (password: Password): E.Either<Error, Password> =>
    pipe(hashFn(password.value), E.map((value) => ({ ...password, value, isHashed: true, })))
const validate = (password: Password): E.Either<never, Password> => E.right({ ...password, isValidated: true })

const pipeline = flow(
    passwordOf,
    validate,
    E.chainW(fromHashed(value => E.right(value)))
)

// The reason why we use chainW instead of chain because we want to widen the final type to include both errors from validate and hash.
// If you hover over pipeline to inspect the type, this is what you would get.

/* pipeline: E.Either<
  MinLengthValidationError | CapitalLetterMissingValidationError | Error,
  Password
>

But if we swap chainW with chain, we would only get the final error type in the chain.
E.Either<Error, Password.Password>  // with chain we have only last error

But note, chain only works here because Error is a superclass of all 3 of our errors.
If the left side of the generic to the function hash was not an Error, we would be forced to use chainW to cover the two Errors from validate.

*/

// TaskEither *****************

const call = async () => await pipe(
    TE.tryCatch(
        () => asyncFunction(), // axios.get('https://httpstat.us/200'),
        (reason) => new Error(`${reason}`),
    ),
    TE.map((resp) => resp),
) // // { _tag: 'Right', right: { code: 200, description: 'OK' } }

// FOLDING *********************

import { absurd, constVoid, unsafeCoerce } from 'fp-ts/lib/function'

const result = pipe(
    TE.tryCatch(
        () => asyncFunction(), //axios.get('https://httpstat.us/200'),
        () => constVoid() as never,
    ),
    TE.map((resp) => unsafeCoerce<unknown, number>(resp)),
    TE.fold(absurd, T.of), // we transform into a task.... 
) // Not executing the promise

// Result is of type:
// T.Task<Resp>

// Asynchronously Error Handling ******************************

declare function begin(): Promise<void>
declare function commit(): Promise<void>
declare function rollback(): Promise<void>

const result2 = pipe(TE.tryCatch(
    () => begin(),
    (err) => new Error(`begin txn failed: ${err}`),
),
    TE.chain(() => TE.tryCatch(
        () => commit(),
        (err) => new Error(`commit txn failed: ${err}`))
    ),
    TE.orElse((originalError) =>
        pipe(TE.tryCatch(
            () => rollback(),
            (err) => new Error(`rollback txn failed: ${err}`) ),
            TE.fold(TE.left, () => TE.left(originalError)),
        ),
    ),
)

// In this example, we try to rollback if the begin or commit operations fail and return the original error.
// If rollback also fails, we return the rollback error.