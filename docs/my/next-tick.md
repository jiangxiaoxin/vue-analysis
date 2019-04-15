# nextTick

这里看下源码里对于`nextTick`的实现。

一般我们对于`nextTick`有下面两种使用方式：给`nextTick`传一个回调函数或者在`then`里执行后续方法。

```js
this.$nextTick(() => {
  console.log(1)
})

this.$nextTick()
  .then(() => {
    console.log(2)
  })
  .then(() => {
    console.log(3)
  })
```

`master`分支上的实现：

```js
export const nextTick = (function() {
  const callbacks = []
  let pending = false
  let timerFunc

  function nextTickHandler() {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  // An asynchronous deferring mechanism.
  // In pre 2.4, we used to use microtasks (Promise/MutationObserver)
  // but microtasks actually has too high a priority and fires in between
  // supposedly sequential events (e.g. #4521, #6690) or even between
  // bubbling of the same event (#6566). Technically setImmediate should be
  // the ideal choice, but it's not available everywhere; and the only polyfill
  // that consistently queues the callback after all DOM events triggered in the
  // same loop is by using MessageChannel.
  /* istanbul ignore if */
  if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    timerFunc = () => {
      setImmediate(nextTickHandler)
    }
  } else if (
    typeof MessageChannel !== 'undefined' &&
    (isNative(MessageChannel) ||
      // PhantomJS
      MessageChannel.toString() === '[object MessageChannelConstructor]')
  ) {
    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = nextTickHandler
    timerFunc = () => {
      port.postMessage(1)
    }
  } else if (typeof Promise !== 'undefined' && isNative(Promise)) {
    /* istanbul ignore next */
    // use microtask in non-DOM environments, e.g. Weex
    const p = Promise.resolve()
    timerFunc = () => {
      p.then(nextTickHandler)
    }
  } else {
    // fallback to setTimeout
    timerFunc = () => {
      setTimeout(nextTickHandler, 0)
    }
  }

  return function queueNextTick(cb?: Function, ctx?: Object) {
    let _resolve
    callbacks.push(() => {
      if (cb) {
        try {
          cb.call(ctx)
        } catch (e) {
          handleError(e, ctx, 'nextTick')
        }
      } else if (_resolve) {
        _resolve(ctx)
      }
    })
    if (!pending) {
      pending = true
      timerFunc()
    }
    // $flow-disable-line
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        _resolve = resolve
      })
    }
  }
})()
```

这里有这么几点值得注意：

1. 导出的`nextTick`用了立即执行函数返回了另外一个方法，在新返回的方法里定义了一个作用域
2. 返回的方法可以传入两个参数，`cb`和`ctx`。在`queueNextTick`里先`push`回调方法到局部作用域的`callbacks`里，然后执行`timerFunc`，而`timerFunc`是个**异步执行函数**，其实际的执行代码并不会立即执行。而是接着执行下面的判断，如果没有`cb`，就返回一个`Promise`，并且把后续的`resolove`保存起来。这之后才是去真正的执行回调方法了。这时候发现`cb`是没有的，那就执行`else`里`_resolve(ctx)`
3. 上面的代码执行顺序用到了`event loop`，`microtask` `macrotask`的概念
