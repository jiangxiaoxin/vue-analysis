# [Closures](https://css-tricks.com/javascript-scope-closures/)

Whenever you create a function within another function, you have created a closure. The inner function is the closure. This closure is usually returned so you can use the outer function's variables at a later time.

> 有一个方法，对于同样的参数输入，会得到同样的输出结果。但是这个方法非常地麻烦耗时，而应用中又会多次使用到它，那就应该把同样的参数输入得到的结果缓存起来。

```js
var a = 'abscded'

function toUpper(a) {
  console.log('转成大写')
  return !!a && a.toUpperCase()
}

function cached(fn) {
  var cache = Object.create(null)
  return function cachedFn(str) {
    var hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

var upper = cached(str => {
  return toUpper(str)
})

for (var i = 0; i < 10; i++) {
  var res = upper(a)
  console.log(`res ${i} ${res}`)
}
```

`function cached(fn) {...}` 传入一个方法，返回一个新方法，创建一个返回方法能访问的`cache`，每次执行时从已缓存的结果里查找，找到就返回，没找到就先执行一次，并把结果缓存起来，然后返回结果。

> 这玩意叫`closure`,中文叫**闭包**，然而我是无法从名字上想象出这是个啥的。其实不用纠结它到底是个啥意思，只记住一点，就是**创建一个方法和这个方法能“存活”的上下文**。

[相关链接](https://medium.com/@oneminutejs/javascript-closures-explanations-and-open-source-examples-a3731848f658)

