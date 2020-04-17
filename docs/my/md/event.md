# event: $on $off $once

> 所有的事件系统都是一条准则：谁发生的事件谁去处理。

组件自定义事件机制。在`$on`的时候把事件和事件处理函数记录下来，`$emit` 时找出跟事件对应的处理函数 `let cbs = vm._events[event]`，最后去执行 `cbs[i].apply(vm, args)`

```js
export function eventsMixin(Vue: Class<Component>) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function(
    event: string | Array<string>,
    fn: Function
  ): Component {
    const vm: Component = this
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$on(event[i], fn)
      }
    } else {
      ;(vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  Vue.prototype.$once = function(event: string, fn: Function): Component {
    const vm: Component = this
    function on() {
      vm.$off(event, on) // 先$off删除事件监听，再执行事件回调
      fn.apply(vm, arguments)
    }
    on.fn = fn
    vm.$on(event, on) // 利用$on监听event并执行on的回调，on.fn把回调记录下来，便于$off时候判断
    return vm
  }

  Vue.prototype.$off = function(
    event?: string | Array<string>,
    fn?: Function
  ): Component {
    const vm: Component = this
    // all
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$off(event[i], fn)
      }
      return vm
    }
    // specific event
    const cbs = vm._events[event] // 找出事件对应的回调函数
    if (!cbs) {
      // 如果找不到，说明没记录过，直接返回
      return vm
    }
    if (arguments.length === 1) {
      // 如果参数只有1个，那就是 $off('xxxx')这样的调用方式，就把所有的事件处理方法都删除
      vm._events[event] = null // 所以这里数组直接清空
      return vm
    }
    if (fn) {
      // 如果参数传入了fn，那就是删除特定的某个回调方法
      // specific handler
      let cb
      let i = cbs.length
      while (i--) {
        cb = cbs[i]
        if (cb === fn || cb.fn === fn) {
          // 遍历一下，找出对应的项然后删掉。这里 cb.fn === fn 是处理 $once的情况，$once存事件回调的时候特殊一点，添加了个属性fn
          cbs.splice(i, 1)
          break
        }
      }
    }
    return vm
  }

  Vue.prototype.$emit = function(event: string): Component {
    const vm: Component = this
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
            `${formatComponentName(
              vm
            )} but the handler is registered for "${event}". ` +
            `Note that HTML attributes are case-insensitive and you cannot use ` +
            `v-on to listen to camelCase events when using in-DOM templates. ` +
            `You should probably use "${hyphenate(
              event
            )}" instead of "${event}".`
        )
      }
    }
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      for (let i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args)
        } catch (e) {
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return vm
  }
}

/**
 * Convert an Array-like object to a real Array.
 * 有些collectionList就是array-like
 */
export function toArray (list: any, start?: number): Array<any> {
  start = start || 0
  let i = list.length - start
  const ret: Array<any> = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

```
