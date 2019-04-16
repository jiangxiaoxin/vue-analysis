### Vue实例上的属性

1. _isVue

The `Vue.prototype._init` method sets a property on the Vue instance object called `._isVue` and sets it to `true` as a flag in order to **prevent it from being observed:**

2. _uid
3. _isComponent

`options._isComponent` is only set to `true` in one instance throughout the Vue.js source code — in the `createComponentInstanceForVnode` function

4. _self