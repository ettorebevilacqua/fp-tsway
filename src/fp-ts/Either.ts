import { Either, left, right, chain } from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"

/**
username must not be empty
username can't have dashes in it
password needs to have at least 6 characters
password needs to have at least one capital letter
password needs to have at least one number
*/

const minLength = (s: string): Either<string, string> =>
  s.length >= 6 ? right(s) : left("at least 6 characters")

const oneCapital = (s: string): Either<string, string> =>
  /[A-Z]/g.test(s) ? right(s) : left("at least one capital letter")

const oneNumber = (s: string): Either<string, string> =>
  /[0-9]/g.test(s) ? right(s) : left("at least one number")

const validatePassword = (s: string): Either<string, string> =>
  pipe(
    minLength(s),
    chain(oneCapital),
    chain(oneNumber)
  )

console.log(validatePassword("abc"))
console.log(validatePassword("abcdef"))
console.log(validatePassword("AbcDef"))