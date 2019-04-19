# reactive & initState

```js
export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) { // 如果options里有data属性，就要从里面求一次值获得js object形式的值。组件可以有多个实例，这样子防止多个实例之间修改同一份数据
    initData(vm)
  } else { // 没有data就直接开始observe
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

组件在初始化的时候，在`initState`中会进行`initProps` `initMethods` `initData` `initComputed` `initWatch`，这几步就对应这个组件自身的属性`props` `methods` `data` `computed` `watch`。如果本身没有data这个属性，就会执行`observe(vm._data = {}, true /* asRootData */)`,跳过响应式的依赖收集过程，这就是为啥如果你有数据发生变化后要`Dom`显示响应式的变化必须在写组件的时候就把属性写上去，即使给个空值。

```js
function initData (vm: Component) {
  let data = vm.$options.data // 这并不是组件的data属性，而是经过 mergeOptions之后合并的data属性
  data = vm._data = typeof data === 'function'
    ? getData(data, vm) // 去执行一次data这个function，获取一次数据对象。
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  // 遍历data中的key，防止跟props和methods里的key冲突
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key) // 将key的访问代理到vm实例上，也就是 this.xxx就可以访问 this.$data.xxx的值
    }
  }
  // observe data
  observe(data, true /* asRootData */)
}
```