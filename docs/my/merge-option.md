### mergeOptions



### normalizeProps

```js
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) { // 如果传入的props是个数组。props是可以传入数组形式的，比如 props: ['name', 'age', 'count']
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null } // 以数组形式传入时，就不能明确每个prop的类型了，所以统一都设为null
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {  // 如果传入的是Object形式，那有两种 props: { name: String, age: Number} 或者 props: { name: {type:String, default: 'hello'}, age: {type:Number, default: 18}}
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) // 根据传入的具体形式，age: Number 还是 age:{type: Number, default: 18}来设置
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production' && props) {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}
```