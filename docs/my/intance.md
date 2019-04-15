我们一般工程开发都是用`vue-cli`创建项目，然后基于单`vue`文件的模式去进行组件开发。这种模式下，在`npm run build`的过程中，框架会将`.vue`文件里的代码编译成`render`函数在运行时使用。因为已经编译过了，所在我们在用的时候只要导入`Vue runtime`即可使用。  

`Vue`本身它还导出了`runtime + compiler`的版本，这样子可以在写的时候，在`html`文件里通过`script`标签将编译好的`Vue`的库文件加载，然后将本`html`文件的代码在运行时进行解析和构建。比如下面的例子：

```html
<div id="app">
    <input type="text" v-model="word">
    <p>{{word}}</p>
    <button v-on:click="sayHi">change model</button>
</div>

<script src="./xx/xx/xx/vue.js"></script>

<script>
    var vm = new Vue({
        el: '#app',
        data: {
            word: 'Hello World!'
        },
        methods: {
            sayHi: function() {
                this.word = 'Hi, everybody!';
            }
        }
    });
</script>
```

上面的代码里，`Vue`会查找`el`指定的元素，然后获取它的`html string`，进而解析编译成`Vue`程序。这就是为啥源码里有去判断`el`是否带`#`，并且拿`outerHtml`的地方。