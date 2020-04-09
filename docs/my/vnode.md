`Vnode` 用来对真实的 Dom 结构进行抽象描述，记录了 Dom 元素的各种属性。

在描述一个节点（也就是元素）时，基本结构如下:

```js
/**
* Vnode 基本描述
*/
var vnode = {
    tag: 'div',
    data: {
        style: {
            width: '100px',
            height: '100px'
        }
    },
    children: {
        // children object or children list
    }
}
```

`tag` 表示对应的 Dom 元素类型，`data` 表示节点自身的属性描述，`children` 可以是对象也可以是对象数组，记录节点的子节点。整个结构是一个嵌套的树形结构描述。

有一个特殊的节点叫**文本节点**，它本身就是些文字，并没有真实的 `tag` 属性，所以在描述此类节点时，只列出其最重要的文字数据。所以在`Vue`的源码里在创建此类节点时调用构造函数都是传了一堆的`null`，只把文本传进去了。

```js
var textNode = {
    tag: null,
    data: null,
    children: '我是文本节点'
}
```
