# 针对源码分析中的一些步骤、技巧做一些提问

1. 下面代码有啥问题？

```js
props： {
    name: String,
    age: Number
}

data() {
    return {
        name: 'mike',
        age: 18
    }
}
```

props和data中有同名的属性，这会引起冲突，在组件里访问这些数据都是this.name,this.age的方式。在init的过程中，有一步`initState`，会对`props` `data` `methods` `computed`做响应式转化，在这一过程中会有同名的判断。

2. 下面的代码中,访问msg最常用的this.msg，但是这个msg属性是绑定在data上的，为什么可以这么直接访问呢？

```js
data() {
    return {
        msg: 'hello'
    }
}
```

在`initState`的过程中，在`initData`的时候，有一步`proxy`的过程，如果data的属性在vm实例上没有，那么就用`Object.defineProperty`对vm进行代理设置，让`this.xxx`的访问代理到`this._data.xxx`上