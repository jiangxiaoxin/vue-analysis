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

`Watcher`到底是个什么角色？在一个 Vue 实例(VueComponent 也是 Vue 实例)，如果实例针对某个“属性”发生变化时要触发一些操作，那这种“订阅”操作就由 Watcher 去代理。

在 watcher.html 的代码里，当点击 button 时，`counter` 会发生改变，从而导致 p 标签显示发生变化，这是个 render 渲染过程，`vm` 创建了一个 `watcher` 专门来做这件事，创建时传入的第二个参数 `expOrFn` 是个回调方法，`updateComponent = () => {vm._update(vm._render(), hydrating)}`,这个 watcher 是个 render watcher，用来改变渲染的。那如果再加个 button，点击后改变另外个属性，也有个对应的 p 标签发生变化，会不会创建另外个 render watcher 呢？**不会的**。render watcher 的职责是渲染发生变化时修改 vm 的显示，而不是修改 vm 某个标签的显示，**只有一个**。但是这并不是说一个 vm 只有一个 watcher 哦。代码里有 watch 属性，它观察住另外两个属性 `counter` 和 `oddOrEven`，他们发生变化后会执行对应的操作，那这个时候就会分别创建对应的 `watcher` 实例，传入的 `expOrFn` 就是 `counter` 和 `oddOrEven`这俩字符串(所以源码里 `expOrFn` 的类型是 `String|Function`)，而 `cb` 就是 watch 里它们各自对应的回调方法了。所以打印 `vm` 的`_watchers` 属性里面有 3 个 watcher 实例。

> `vm._watcher` 是 `vm` 的 render watcher，只有一个，所有的更新操作都由它代理了。`vm._watchers` 是 vm 的所有的 watcher 的集合.
