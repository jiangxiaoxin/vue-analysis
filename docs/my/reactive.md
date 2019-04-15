# 响应式原理

点击按钮total加1，触发新的渲染，大体流程如下：

`total+1` => `reactiveSetter` => `dep.notify()` => `[watcher, watcher,....].forEach(() => watcher.update)` => `queueWatcher` => `nextTick` => `run` => `get` => `updateComponent` => `Vue._render`

一个`dep`就是要给可以观察的项，收集好所有关注这个项的`watcher`，等该项`reactiveSetter`的时候就通知所有的`watcher`更新。

每次要更新内容的时候，它不是立马更新，而是有个`nextTick`的更新合并。更新后会重新收集新的依赖项。

```js
/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
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

  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
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
    set: function reactiveSetter (newVal) {
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      if (newVal === value || (newVal !== newVal && value !== value)) {
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
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}
```

上面是`Vue`里对属性进行响应式改造的关键代码。对于每个键，它都重写了键的`getter`和`setter`。  

一进入`defineReactive`方法，首先执行`new Dep()`，创建了一个跟这个`key`对应的`Dep`实例，随后`defineProperty`重写`key`的`getter`和`setter`,在`get`方法里，调用了`dep.depend()`进行依赖收集。在`set`方法里，如果改写之前就有`setter`方法就去执行(`setter.call(obj, newVal)`)，如果没有就直接改值(`(val = newVal)`)，关键是设置好值之后通过`dep.notify()`通知所有关注此项的`watcher`实例。

#### defineReactive

> `const dep = new Dep()` -> `dep.depend()` -> `Dep.target.addDep(this)` -> `dep.addSub(this)` -> `this.subs.push(sub)`。

创建`dep`实例，然后在`getter`方法里调用`dep.depend()`收集依赖，这就会调用`dep`中的`Dep.target.addDep(this)`，而`Dep.target`是个`watcher`，这就是调用`watcher`的`dep.addSub(this)`，而这就会调用`dep`对象的`this.subs.push(sub)`，这里传进来的`sub`是个`watcher`实例，到此：一个`key`，也就是一个需要关注的项，就把所有关心它的`watcher`都收集起来了。更新这些`key`的值时，就会调用`setter`方法，然后就会`dep.notify()`,调用所有相关的`watcher`的更新方法`update`。