---
title: "Vue Inject API 工作原理"
description: "Vue Inject API 工作原理"
pubDate: "Oct 20 2024"
heroImage: ""
mark: true
---

了解 `Vue` 中 `provide` `inject` api 工作原理

### 基本用法

在 Vue 中 `provide` `inject` 的作用是提供跨组件层级的数据传递，在父组件中通过 `provide` 提供数据，在此父组件之下的所有子组件都可以通过 `inject` 来使用提供的数据。

```html
<!--parent-->
<script setup>
  import { provide } from "vue";

  const foo = ref("yes");
  provide("foo", foo);
</script>

<!--child-->
<script setup>
  import { inject } from "vue";

  // foo is `Ref` via provide, 'no' as default value when foo is empty
  const foo = inject("foo", "no");
</script>
```

### 实现原理

`provide` 实现的非常优雅，本质上是直接通过 JS 原型链直接向上查找

#### 调用 provide 时发生了什么

`provide('foo', foo)`

1. 首先找到当前组件的 `providers` 和父组件的 `providers` 对象
   ```js
   let providers = currentInstance.providers;
   const parentProviders = currentInstance.parent.providers;
   ```
2. 如果两者相等，则代表当前组件还没有自己的 `providers`，因为默认是通过原型链继承下来的
3. 根据父级 `providers` 作为原型对象创建当前组件的 `providers` 对象
   ```js
   if (providers !== parentProviders) {
     providers = currentInstance.providers = Object.create(parentProviders); // 关键：基于父组件providers为原型创建对象
   }
   ```
4. 最后直接给 `providers赋值即可`
   ```js
   providers[key] = value;
   ```

完整源码（简化）

```js
export function provide(key, value) {
    let provides = currentInstance.provides
    const parentProvides =
      currentInstance.parent && currentInstance.parent.provides
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides)
    }
    provides[key as string] = value
  }
```

#### inject

在使用 `inject` 的时候就很简单了

```js
inject('foo')
```

查找链路是直接访问到 `currentInstance.providers`（默认继承自 parent） 对象

访问 `providers` 根据原型链规则，自动查找父级的属性 
