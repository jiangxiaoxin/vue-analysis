## initComputed

`initComputed`发生在`initState`过程中

```js
function initComputed (vm: Component, computed: Object) {
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  const isSSR = isServerRendering()

  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }

    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}
```

```js
new Vue({
  ...
  ...

  compunted: {
    fullName: function() {
      return this.firstName + '_' + this.lastName
    }
  }
})
```

传入两个参数，一个`vm: Component`就是组件(`VueComponent`)实例或者`Vue`实例，一个`computed: Object`就是该实例的`computed`属性对应的值。下面一个`for`循环去遍历`computed`所有的`key`，如果`computed[key]`是个`function`(就是上面的`fullName`),那这个“属性”的`getter`就是这个方法。如果不是`function`，那就取`userDef.get`当作`getter`，这就是下面一个少见的使用，`computed`里的属性可以定义`set`方法。当用`this.fullName = 'xxxx'`的时候就会调用这个`setter`方法.  

`if (!(key in vm))`做判断，`computed`里定义的“属性”不能跟`data`和`props`里重复。

```js
new Vue({
  ...
  ...
  computed: {
    fullName: {
      get: function() {
        return this.firstName + '_' + this.lastName
      },
      set: function() {
        var names = this.fullName.split('_')
        this.firstName = names[0]
        this.lastName = names[1]
      }
    }
  }
})
```

```js
export function defineComputed (
  target: any,
  key: string,
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      ? createComputedGetter(key)
      : userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
```

在`defineComputed`里会对传进去的`computed`是`function`还是`object`做处理。
