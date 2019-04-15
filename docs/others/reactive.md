# 响应式原理

点击按钮total加1，触发新的渲染，大体流程如下：

`total+1` => `reactiveSetter` => `dep.notify()` => `[watcher, watcher,....].forEach(() => watcher.update)` => `queueWatcher` => `nextTick` => `run` => `get` => `updateComponent` => `Vue._render`

每次要更新内容的时候，它不是立马更新，而是有个`nextTick`的更新合并。更新后会重新收集新的依赖项