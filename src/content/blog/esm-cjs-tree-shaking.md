---
title: "CJS 、ESM 与 TreeShaking"
description: "为什么 CommonJS 不支持 TreeShaking"
pubDate: "March 8 2025"
mark: false
---

了解`CJS(CommonJS)`与`ESM(ECMA Script Module)`的工作方式，以及为什么`CJS`不支持`Tree Shaking（树摇）`

## 什么是 `CJS`

一个专门为 Node.js 设计的，打包 JavaScript 的模块化标准。
在 Node.js 中，每个文件都被视为一个模块，每个模块中都能定义导入、导出。一个例子：

```js
// tools.js
const { maxBy } = require("lodash");

const fns = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
};
// 导出成员
Object.keys(fns).forEach((fnName) => (module.exports[fnName] = fns[fnName]));
```

在另一个文件中引用

```js
// index.js
const { add } = require("tools.js");

add(1, 2);
```

### CJS 工作方式

在 CJS 模块中，实际上需要被执行的代码会被包装在一个函数中执行，一个 webpack 中的实现：

```js
(function (module, exports, __webpack_require__) {
  // ...module code
});
```

从这里可以看出来，我们为什么可以在代码中使用 `export`、`module`、 `require` 等关键字进行导出和导入

#### Q: 为什么可以使用 `module.exports = {}`

A: 在 CJS 中一个模块在内部的定义，和 `require` 函数的实现方式

```js
function __webpack_require__(moduleId) {
  // Check if module is in cache
  var cachedModule = __webpack_module_cache__[moduleId];
  if (cachedModule !== undefined) {
    return cachedModule.exports;
  }
  // Create a new module (and put it into the cache)
  var module = (__webpack_module_cache__[moduleId] = {
    id: moduleId,
    loaded: false,
    exports: {},
  });

  // Execute the module function
  __webpack_modules__[moduleId].call(
    module.exports,
    module,
    module.exports,
    __webpack_require__
  );

  // Flag the module as loaded
  module.loaded = true;

  // Return the exports of the module
  return module.exports;
}
```

可以看到最终返回的就是 `module.exports`，`exports` 只是 `module` 对象中的一个属性，并且通过`require`导入的模块只会被执行一次，之后再次执行就会直接使用换成中的结果。

#### Q: 为什么 `exports = {}` 是错误的用法

A: 这个很明显了，在 `requrie` 函数中 最终返回的是 `module.exports` ，`exports` 只是`require`函数的一个形参，直接修改形参并不会影响到最终返回的`module.exports`

## 什么是 ESM

一个由官方(ECMA)提供的模块化标准，模块使用 `import` 和 `export` 进行导入和导出，一个例子：

```js
function add() {}

export { add };
```

`ESM` 的导入和导出必须是完全静态的，所有的 `import` 都会被提升到最上面，且导入导出的关系是引用的关系并不是想 CJS 直接执行代码的这种复制关系，且无法直接修改导入的对象，因为导入的对象完全是只读的
```js
// tools.js 
export let name = 'jackson';

// index.js
import { name } from 'tools'

// 以 rollup 为例。编译阶段抛出的错误
name = 'xuany' // [!] RollupError: index.js (4:0): Illegal reassignment of import "name" in "index.js".
```
由于必须是静态的，所以 `import`、`export` 不能被定义在条件语句中，但是有一个例外，就是 `import` 支持的动态导入, 在这里执行 `import` 返回的是一个异步 Module 结果。
```js
if (needImport) {
    const module = await import('./xxx.js')
}
```

## 什么是 TreeShaking

在一些现代模块化打包工具中，比如 `webpack`、`rollup` 等工具中，会针对 `ESM` 模块的导入导出进行静态分析，通过静态分析，在编译阶段就能够发现一些代码从未被使用，这些代码就会在构建的产物中被移除，以减少最终产物的包体积。

一个 `rollup` 的打包例子

```js
// tools.js
export function add(a, b) {
  return a + b;
}
export function maxBy(a, b) {
  return Math.max(a, b);
}
export function substract(a, b) {
  return a - b;
}

// index.js
import { add } from "./tools";
console.log("add result: ", add(1, 2));

// rollup.config.js
import { defineConfig } from "rollup";

export default defineConfig({
  input: ["index.js"],
  output: {
    dir: "dist",
    format: "esm",
  },
});
```

看下最终的打包产物

```js
// index.js of output
"use strict";

function add(a, b) {
  return a + b;
}

console.log("add result: ", add(1, 2));
```

可以看到，最终的产物中只有 `add` 函数。

## 为什么 CJS 不支持 TreeShaking

CJS 最初是为了 Node.js 设计的，Node.js 应用运行在服务器端，所以在设计时没有考虑到包体积问题，现代 webapp 由于是需要由用户侧去加载 js 资源，所以对包体积比较敏感。

看个 CJS 例子

```js
// index.js just use add of lodash
const { add } = require("lodash");

console.log("add result: ", add(1, 2));

// 打包产物 index.js
var commonjsGlobal =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof window !== "undefined"
    ? window
    : typeof global !== "undefined"
    ? global
    : typeof self !== "undefined"
    ? self
    : {};

function createCommonjsModule(fn, module) {
  return (module = { exports: {} }), fn(module, module.exports), module.exports;
}

var lodash = createCommonjsModule(function (module, exports) {
  // ...此处省略 1w+ 行代码...
});

const { add } = lodash;

console.log("add result: ", add(1, 2));
```

可以看到整个 lodash 都被打包到产物中

与 ESM 相比，ESM 语法更容易进行静态分析，一个刚刚上面的例子

```js
// tools.js
const { maxBy } = require("lodash");

const fns = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
};
// 导出成员
Object.keys(fns).forEach((fnName) => (module.exports[fnName] = fns[fnName]));

// index.js example for require
const name = localStorage.getItem("toolFileName") || "tools.js";
const tools = require(name); // !!!name is unknown at compile time!!!
```

在 CJS 的导出语法中，我们可以在任意位置进行导出，在编译接端打包器甚至不知道到底该导出哪些模块，这对与编译阶段的静态分析是致命的，同时导入语法也是完全动态的，因为这些导出具体的值只能在运行时才有结果，因此如果项目中存在导入 CJS 的包，你的打包器可能将无法对最终的结果进行 **TreeShaking**

## 总结

**尽量避免在项目中依赖只支持 `CommonJS` 的包，现代构建工具大部分都支持同时输出 `ESM` 和 `CJS`，并在整个应用中使用`ESM`语法。**

## 更多资料

1. [CJS 模块加载机制](https://javascript.ruanyifeng.com/nodejs/module.html)
