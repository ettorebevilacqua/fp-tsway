https://serokell.io/blog/algebraic-data-types-in-haskell

Let’s start by creating a data type for a 2-dimensional point.

New data types are created via the data keyword. To create a Point data type, we need to provide a type constructor (the name of our type) and a data constructor (used to construct new instances of the type), followed by the types our type will contain.

```text
--    [1]     [2]       [3]
data Point = Point Double Double
  deriving (Show, Eq)

-- [1]: Type constructor.
-- [2]: Data constructor.
-- [3]: Types wrapped.
```

First of all, there’s a difference between the type constructor and the data constructor. In our example, they are called the same, but they could have been Point and Point2D, for example. This frequently confuses beginners.

Type constructor         |    Data constructor
Name of the type.       | Used to construct an instance of a type.
Each type can have only one type constructor. | Each type can have multiple data constructors (in case of sum types).

Second, adding deriving (Show, Eq) to the type definition above makes it possible to print values of the type and to compare them for equality. You can read more about deriving in this blog post.

```text
 a = Point 3 4
 ```

```text
 *Main> distance (Point x1 y1) (Point x2 y2) = sqrt ((x1 - x2) ^ 2 + (y1 - y2) ^ 2)
*Main> a = Point 3 4
*Main> b = Point 1 2
*Main> distance a b
2.8284271247461903
```

### Definition of a product type

We call Point (and all types with a similar structure) a product type. All product types combine multiple elements that are in the data structure at the same time. It’s the same as saying that you need this type and that type.

### Polymorphic data types

Our previously created Point data type can contain only double-precision floats.

In some cases, we would want it to work with other numbers as well. If so, we need to make it polymorphic (able to work with multiple different data types).

```text
data PPoint a = PPoint a a
  deriving (Show, Eq)
```

To better illustrate this fact, we can look at the kinds of both functions. While it is not possible to fully explain kinds (tipi) in this article, you can think of them as type signatures for types.
vedi  TypesKinds.md.

As we can see, Point is a concrete type.

*Main> :kind Point
Point :: *
In contrast, PPoint is a function that takes a type and returns a concrete type.

*Main> :kind PPoint
PPoint :: * -> *
Another typical example of a polymorphic product type is the tuple type.

*Main> :info (,)
type (,) :: * -> * -> *
data (,) a b = (,) a b
It takes two types – a and b – and returns a type that has a in the first slot and b in the second slot.

### Sum types

There’s another flavor of types – sum types – that lists several possible variants a type could have. You might have encountered something similar under the name of enums or union types.

The simplest example of a sum type is Bool.

```text
--    [1]    [2] [3] [4]
data Bool = False | True

-- [1]: Type constructor.
-- [2, 4]: Data constructors.
-- [3]: The pipe operator that separates data constructors.
```

Bool can be constructed by either True or False.

We can make functions such as a negation that work on the values of Bool.

```text
neg :: Bool -> Bool
neg True = False
neg False = True
```

There are a lot of sum types in the wild that you wouldn’t even necessarily recognize as such. While it is not defined that way, an Int can be thought of as the enumeration of all the entries in [-2^29 .. 2^29-1], for example.

A more nontrivial example of a sum type would be a data type that fits both a 2-dimensional and a 3-dimensional point.

data Point = Point2D Double Double | Point3D Double Double Double
  deriving (Show, Eq)

Now we can write a function that accepts both types of points by pattern matching on the data constructors.

```text
pointToList :: Point -> [Double]
pointToList (Point2D x y) = [x, y]
pointToList (Point3D x y z) = [x, y, z]
```

Here’s an example of its usage:

```text
*Main> a = Point2D 3 4
*Main> b = Point3D 3 4 5
*Main> pointToList a
[3.0,4.0]
*Main> pointToList b
[3.0,4.0,5.0]
```

### Product types vs. sum types

Here’s a small table to help you remember the differences between these two groups of types.

Product types	Sum types
Example	data (,) a b = (,) a b	data Bool = False | True
Intuition	Give me a and b	Give me a or b

### Algebraic data types
So why are these types called product and sum types? Let’s get into it.

If you remember your school math lessons, you worked with numbers ( 1,2,3 etc ), variables (x, y, z) and operators ( +,-,* etc)
In algebraic data types, our numbers are the number of possible values a type can have and our operators are | and data constructors.

