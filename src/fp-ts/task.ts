import * as T from "fp-ts/lib/Task"
import * as Either from "fp-ts/lib/Either"
import * as TaskEither from "fp-ts/lib/TaskEither"

// Asyncronous task that ever failed
const deepThought: T.Task<number> = () => Promise.resolve(42)

async function think() {
  const n = await deepThought()
  console.log(n)
}

think()

