# 将文件多余的缩进删除

```js
var splitRE = /\r?\n/g
var emptyRE = /^\s*$/
var needFixRE = /^(\r?\n)*[\t\s]/

module.exports = function deindent (str) {
  if (!needFixRE.test(str)) {
    return str
  }
  // 将文本按照换行符进行切割，分成一行一行的
  var lines = str.split(splitRE)
  var min = Infinity
  var type, cur, c
  // 对于每一行，如果都是空行，那就退出到最后了，最后就是line.slice(Infinity)，得到个空字符串，那合并起来，全部就是个空
  // 如果行的字符串不是空的，那就测试前面有多少个“缩进符”，并且确定所有行中，最小公共部分，这样最后可以安全的缩减缩放。
  // if(!type){} 一开始是没有type的，因为确定不了，缩进有的是用tab，有的用空格，那就认定第一次出现空格或者tab的行的换行符为type，之后处理都是删减这个type对应的缩放符
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    if (!emptyRE.test(line)) {
      if (!type) {
        c = line.charAt(0)
        if (c === ' ' || c === '\t') {
          type = c
          cur = count(line, type)
          if (cur < min) {
            min = cur
          }
        } else {
          return str
        }
      } else {
        cur = count(line, type)
        if (cur < min) {
          min = cur
        }
      }
    }
  }
  // 将文本的每一行都截取相同数量的缩进符号，这样最后剩下的字符串join之后还是有合适的缩进的
  return lines.map(function (line) {
    return line.slice(min)
  }).join('\n')
}

// 测算一行文本从头开始有多少个type类型的字符，这个type字符就是缩进，直到line的字符不是缩进的符号了
function count (line, type) {
  var i = 0
  while (line.charAt(i) === type) {
    i++
  }
  return i
}

```