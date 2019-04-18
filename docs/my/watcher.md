# Watcher

参照[watcher.html](./htmls/watcher.html)的代码看问题。

```js
export default class Watcher {
  [.....]

  constructor(
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object) {
      this.vm = vm
      vm._watchers.push(this)
      [....]
      [....]
  }
}
```

