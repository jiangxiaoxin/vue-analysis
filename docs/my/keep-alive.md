`keep-alive`是个虚拟组件，本身不渲染任何实际的`dom`元素，如果缓存也只是缓存它内部第一个子元素

如何查找的第一个子元素？

```js
// 很简单的数组遍历，找到第一个不为空且有options的元素
function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}
```

源代码

```javascript
/* @flow */

import { isRegExp, remove } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'

type VNodeCache = { [key: string]: ?VNode }

function getComponentName(opts: ?VNodeComponentOptions): ?string {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches(pattern: string | RegExp | Array<string>, name: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1
  } else if (isRegExp(pattern)) {
    return pattern.test(name)
  }
  /* istanbul ignore next */
  return false
}

function pruneCache(keepAliveInstance: any, filter: Function) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cachedNode: ?VNode = cache[key]
    if (cachedNode) {
      const name: ?string = getComponentName(cachedNode.componentOptions)
      if (name && !filter(name)) {
        // 如果有component name并且name不满足filter条件，就把该key对应的实例删除
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
}
// 从cache数组里删除缓存的实例
function pruneCacheEntry(cache: VNodeCache, key: string, keys: Array<string>, current?: VNode) {
  const cached = cache[key]
  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number],
  },

  created() {
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed() {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted() {
    this.$watch('include', val => {
      pruneCache(this, name => matches(val, name))
    })
    this.$watch('exclude', val => {
      pruneCache(this, name => !matches(val, name))
    })
  },

  render() {
    const slot = this.$slots.default
    const vnode: VNode = getFirstComponentChild(slot)
    const componentOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      // check pattern
      const name: ?string = getComponentName(componentOptions)
      const { include, exclude } = this
      if (
        // not included
        // 如果有include，但是组件没有name或者虽然有但是name不在include里，那就不要缓存，直接返回vnode
        (include && (!name || !matches(include, name))) ||
        // excluded
        // 如果有exclude，那就查验name是不是在exclude列表里，在就不要缓存，直接返回vnode
        (exclude && name && matches(exclude, name))
      ) {
        return vnode
      }

      // 对要缓存的vnode执行缓存操作
      const { cache, keys } = this
      const key: ?string =
        vnode.key == null
          ? // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '')
          : vnode.key
      // 如果key有对应的已经缓存过的实例，那就直接赋值给vnode。如果没有那就缓存vnode
      if (cache[key]) {
        // componentInstance是个VueComponent的实例，记录了当前页面的dom结构。使用keep-alive缓存页面后，页面的整个
        // 结构和元素内容（div p span input）都存起来了，这样再次使用时，就不需要重新创建div p span这些元素，而只要
        // 根据这些元素绑定的数据是否发生变化而响应式的更新。如果不缓存，那么每次都要重新分析页面然后创建这些真的dom元素，
        // 然后再用对应的数据改变对应的显示
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        cache[key] = vnode
        keys.push(key)
        // prune oldest entry
        // 如果超过了最大缓存量就把最早缓存的那个实例删掉
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }
      // 加个标志位，表示这个vnode被缓存了
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  },
}
```
