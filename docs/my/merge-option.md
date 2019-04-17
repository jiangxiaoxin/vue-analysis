### mergeOptions

[a deep dive in the vue js source code: the mergeOptions function](https://medium.com/@oneminutejs/a-deep-dive-in-the-vue-js-source-code-27-the-mergeoptions-function-a-recap-5ba11fa433a9)

```js
vm.$options = mergeOptions(
  resolveConstructorOptions(vm.constructor),
  options || {},
  vm
)
```

在一开始创建`Vue`实例时，`mergeOptions`是把`Vue`这种的`options`还有本次实例时传入的`options`合并成最后生成的实例的`$options`属性。

```js
const extendsFrom = child.extends
if (extendsFrom) {
  parent = mergeOptions(parent, extendsFrom, vm)
}
```

在继续合并的过程中，如果遇到本次实例化用的`options`有`extends`属性，那么这个组件还要从另外的组件上继承东西。既然是从别的地方继承东西，那所有这些`options`其实就都合并成一个`parent`对象上的`options`-“你们都是我的爹”-这个意思。

### normalizeProps

```js
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps(options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    // 如果传入的props是个数组。props是可以传入数组形式的，比如 props: ['name', 'age', 'count']
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
  } else if (isPlainObject(props)) {
    // 如果传入的是Object形式，那有两种 props: { name: String, age: Number} 或者 props: { name: {type:String, default: 'hello'}, age: {type:Number, default: 18}}
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

```js
const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
```

最后合并一个完整的`options`。对于所有`parent`上的`key`都进行`mergeField`，然后对于`child`上的`key`，如果`parent`上没有再进行`mergeField`。在`mergeField`的时候，不同的`key`会有不同的合并策略，按照不同的策略，将`parent`上的值合并到`child`上。
