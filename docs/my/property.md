### Vue 实例上的属性

1. \_isVue

The `Vue.prototype._init` method sets a property on the Vue instance object called `._isVue` and sets it to `true` as a flag in order to **prevent it from being observed:**

2. \_uid
3. \_isComponent

`options._isComponent` is only set to `true` in one instance throughout the Vue.js source code — in the `createComponentInstanceForVnode` function

4. \_self

5. \$parent

组件实例的父组件。创建一个 `Vue` 实例的时候，会从整个组件树上从下往上找一个**非抽象**的父级组件作为它的父组件，该组件也会成为这个父组件的一个子组件。

```js
function initLifecycle(vm) {
  var options = vm.$options

  // locate first non-abstract parent
  // 从组件树底开始遍历出第一个非抽象的父组件。所以 keep-alive里面包的组件并不会以keep-alive为父组件，因为keep-alive是个抽象组件。同样的 transition也不行。
  var parent = options.parent
  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  // 如果能找到父组件，那就 vm.$root = parent.$root设置根组件
  // 如果找不到父组件，那就是整个组件树上没有其他“真实的”组件，这次得到的Vue实例就是根组件，=> vm.$root = vm
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}
```

6. \$children

子组件，跟`$parent`形成对比。一个组件在实例化`_init`之后，会`vm.$children = []`，此时它还没有子组件。但是后续的组件在创建的时候，就会“找爹”,然后前面的组件的`$children`就会有值了。

7. _watcher

vm实例对应的 render watcher，用来重新渲染更新显示的。

8. _watchers