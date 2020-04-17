# 响应式原理

点击按钮 total 加 1，触发新的渲染，大体流程如下：

`total+1` => `reactiveSetter` => `dep.notify()` => `[watcher, watcher,....].forEach(() => watcher.update)` => `queueWatcher` => `nextTick` => `run` => `get` => `updateComponent` => `Vue._render`

一个`dep`就是要给可以观察的项，收集好所有关注这个项的`watcher`，等该项`reactiveSetter`的时候就通知所有的`watcher`更新。

每次要更新内容的时候，它不是立马更新，而是有个`nextTick`的更新合并。更新后会重新收集新的依赖项。

## defineReactive

```js
/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set

  // 在master上是没有这段的，dev上有
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }

// 传入的obj就是组件data方法执行返回的数据，key就是数据的某个key，val就是对应的值。
// 如果val本身还是个对象呢？就需要继续observe下去,才能对它内部的key继续观察。
// shallow 浅的，默认是undefined，所以对于绝大多数情况都是会继续observe下去的，除非明确表示shallow=true
  // data() { return { a : { b : { c : 10 } } } }
  let childOb = !shallow && observe(val)

  // 这里就是精髓所在，用defineProperty覆盖了原来的getter和setter。
  // 原来的getter和setter依然会调用，但同时还会调用另外的代码完成依赖的收集和变化的通知
  // get方法只是定义了如何收集依赖，而不是收集了依赖，如果在其他地方不使用get访问下这个key的值的话，那就不会完成依赖收集。
  // 在任何地方都不调用这个key的get方法，那就根本不需要这个key的值，那当然也就没必要去收集它相关的依赖
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set: function reactiveSetter(newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) { // 旧值和新值得对比
        return
      }
      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal) // 如果新值是object或者array会继续observe下去。
      // 在observe里一开始会判断，如果newVal是String Number等原生的就会直接return的
      dep.notify()
    }
  })
}
```

上面是`Vue`里对属性进行响应式改造的关键代码。对于每个键，它都重写了键的`getter`和`setter`。

一进入`defineReactive`方法，首先执行`new Dep()`，创建了一个跟这个`key`对应的`Dep`实例，随后`defineProperty`重写`key`的`getter`和`setter`,在`get`方法里，调用了`dep.depend()`进行依赖收集。在`set`方法里，如果改写之前就有`setter`方法就去执行(`setter.call(obj, newVal)`)，如果没有就直接改值(`(val = newVal)`)，关键是设置好值之后通过`dep.notify()`通知所有关注此项的`watcher`实例。

> `const dep = new Dep()` -> `dep.depend()` -> `Dep.target.addDep(this)` -> `dep.addSub(this)` -> `this.subs.push(sub)`。

创建`dep`实例，然后在`getter`方法里调用`dep.depend()`收集依赖，这就会调用`dep`中的`Dep.target.addDep(this)`，而`Dep.target`是个`watcher`，这就是调用`watcher`的`dep.addSub(this)`，而这就会调用`dep`对象的`this.subs.push(sub)`，这里传进来的`sub`是个`watcher`实例，到此：一个`key`，也就是一个需要关注的项，就把所有关心它的`watcher`都收集起来了。更新这些`key`的值时，就会调用`setter`方法，然后就会`dep.notify()`,调用所有相关的`watcher`的更新方法`update`。
