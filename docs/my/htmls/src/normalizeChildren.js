function simpleNormalizeChildren (children) {
  for (let i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      let temp = Array.prototype.concat.apply([], children);
      console.log(temp);
      return temp;
    }
  }
  return children
}

// var children = [[1,2], [3,4], [5,6]]
// var result = simpleNormalizeChildren(children);
// console.log(result);

var a = [1, 2, [3, 4], [[5, 6, 7]]]
var b = Array.prototype.concat.apply([], a);
console.log(b);
var c = [].concat(a);
console.log(c);


