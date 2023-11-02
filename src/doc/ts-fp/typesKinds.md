
# Types and Kinds

https://diogocastro.com/blog/2018/10/17/haskells-kind-system-a-primer/

Simply put:

Just like values/terms can be classified into types, types can be classified into kinds.

The values "hello" and "world" are of type String. The values True and False are of type Bool. Similarly, the types String and Bool are of kind *, pronounced “star”.

kinds                  *
types    string         bool
terms "hello" "word"   true false

In standard Haskell, all inhabited types (types that have at least 1 value) are of kind *. So Int, Int -> String, [Int], Maybe Int, Either Int Int are all of kind * because there’s at least one term for each of these types1.

Well, if Maybe and Either are not inhabited types, what are they then? They’re  ***type constructors***

### Data constructors and type constructors

Just like we have data constructors for creating data, we also have type constructors for creating types.

λ> data Person = MkPerson { name :: String, age :: Int }

λ> :t MkPerson
MkPerson :: String -> Int -> Person
***MkPerson is a data constructor*** that, given two values name and age of type String and Int, creates another value of type Person. In other words: 
MkPerson is a value of type String -> Int -> Person.

λ> data Either a b = Left a | Right b
λ> :k Either
Either :: * -> * -> *

Similarly, Either is a type constructor that, given two types a and b of kind *, creates another type of kind *. In other words, Either is a type of kind * -> * -> *.

Just like data constructors are curried and can be partially applied, so can type constructors.

λ> :t MkPerson
MkPerson :: String -> Int -> Person
λ> :t MkPerson "Diogo"
MkPerson "Diogo" :: Int -> Person
λ> :t MkPerson "Diogo" 29
MkPerson "Diogo" 29 :: Person

kinds                            *
types  String -> Int -> Person   Int -> Person        Int -> Person
terms        MkPerson           MkPerson "Diogo"    MkPerson "Diogo" 29

λ> :k Either
Either :: * -> * -> *
λ> :k Either String
Either String :: * -> *
λ> :k Either String Int
Either String Int :: *

kinds   * -> * -> *  |       * -> *      |       *
types  Either        |   Either String   |  Either String Int
terms                                 left "a" right 1

### Type signatures and kind signatures

Just like GHC is usually able to correctly infer the types of variables, it is also usually able to correctly infer the kinds of type variables.

-- The inferred type of `x` is `Bool`
x = True

-- The inferred type of `y` is `String -> IO ()`
y = putStrLn
-- The inferred kind of `a` is `*`
data List a = Cons a (List a) | Nil

-- The inferred kind of `f` is `* -> *`
-- The inferred kind of `a` and `b` is `*`
class Functor f where
  fmap :: (a -> b) -> (f a -> f b)
And just like you can manually specify a variable’s type, you can also manually specify a type variable’s kind using the KindSignatures extension.

x :: Bool
x = True

y :: String -> IO ()
y = putStrLn
{-# LANGUAGE KindSignatures #-}
{-# LANGUAGE ExplicitForAll #-}

data List (a :: *) = Cons a (List a) | Nil

class Functor (f :: * -> *) where
  fmap :: forall (a :: *) (b :: *). (a -> b) -> (f a -> f b)
The ExplicitForAll extension allows us to define each type variable explicitly, which I did here for clarity.ù

### HOFs and HKTs

Just like we can have higher-order functions (HOFs), functions that take other functions as arguments, we can also have higher-kinded types (HKTs), types constructors that take other type constructors as arguments.

λ> :t map
map :: (a -> b) -> [a] -> [b]
Here, map is a function that takes another function of type (a -> b) and a list of type [a].

λ> data NonEmpty f a = MkNonEmpty { head :: a, tail :: f a }

λ> :k NonEmpty
NonEmpty :: (* -> *) -> * -> *
Similarly, NonEmpty is a type constructor that takes another type constructor of kind (* -> *) and a type of kind *.

When applied to [] and Bool, we obtain the type NonEmpty [] Bool, a list of boolean values that is guaranteed to have at least one value.

λ> :t MkNonEmpty True [False, True]
MkNonEmpty True [False, True] :: NonEmpty [] Bool
We can apply this type constructor to any two types, so long as their kinds match the expected kinds, e.g.: NonEmpty [] Int, NonEmpty Tree String or NonEmpty Vector Char.

### Other kinds

Unboxed/unlifted types
Remember when I said all inhabited types are of kind *? Allow me to rephrase that: in standard Haskell, * is the kind of all inhabited boxed (or lifted) types. However, in GHC’s version of Haskell, there are also some inhabited types that don’t fall under this umbrella: unboxed (or unlifted) types.

These are defined in the GHC.Prim module from the ghc-prim package. By convention, all unlifted types end with a #, called the magic hash, enabled by the MagicHash extension. Examples include Char# and Int#. You can even have unboxed tuples (# a, b #) and unboxed sums (# a | b #)!

Each unlifted type has a kind that describes its runtime representation. Is this a pointer to something in the heap? Is it a signed/unsigned word-sized value? The compiler then uses that type’s kind to decide which machine code it needs to produce - this is called “kind-directed compilation”.