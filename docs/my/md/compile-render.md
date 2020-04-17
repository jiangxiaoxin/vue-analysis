编写vue单文件组件，最后打包时都会进行编译，最后导出的是类似下面这样的render方法。

```js
var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", { attrs: { id: "app" } }, [
    _c("img", {
      attrs: { alt: "Vue logo", src: require("./assets/logo.png") }
    }),
    _c("p", [_vm._v(_vm._s(_vm.count))]),
    _c(
      "button",
      {
        on: {
          click: function($event) {
            return _vm.pressMe()
          }
        }
      },
      [_vm._v("press me")]
    )
  ])
}
var staticRenderFns = []
render._withStripped = true

export { render, staticRenderFns }
```