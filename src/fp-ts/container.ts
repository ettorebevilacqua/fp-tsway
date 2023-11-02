function Container<T>(val: T) {
    this.value = val
}

Container.of = function <T>(x: T) {
    return new Container(x)
}

Container.prototype.map = function <T, TMap>(f: (val: T) => TMap) {
    return Container.of(f(this.value))
}

console.log(Container.of(5))
console.log(Container.of("a dog"))
console.log(Container.of({ name: "foo" }))

console.log(Container.of(2).map(two => two + 2))
console.log(Container.of("small").map(s => s.toUpperCase()))
console.log(Container.of("go").map(s => s + " away!"))