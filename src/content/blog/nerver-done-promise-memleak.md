---
title: "永不结束的Promise导致内存泄漏"
description: "永不结束的Promise导致内存泄漏"
pubDate: "Mar 20 2025"
heroImage: ""
mark: false
note: true
---

## 场景

频率过高调用同一个接口的接口竞争问题 （由于各种原因不能使用`AbortController`来取消请求）

有问题的代码

```ts
export function keepLastRequest() {
  let latestId = 0;
  return (fn: () => Promise<any>) => {
    const currentId = ++latestId;
    return fn()
      .then((r) => {
        if (latestId === currentId) {
          return r;
        }
        return new Promise(); // never end
      })
      .catch((e) => {
        if (currentId === latestId) {
          throw e;
        }
        return new Promise();
      });
  };
}
```

使用，在 SSR 发生内存泄漏

```ts
const keepLatest = keepLastRequest();

function do() {
  // ...code
  const result = await keepLatest(() => getProducts());
  // ...code
}
```

## 修复

```ts
export function keepLastRequest() {
  let latestId = 0;
  return (fn: () => Promise<any>) => {
    const currentId = ++latestId;
    return fn()
      .then((r) => {
        if (latestId === currentId) {
          return r;
        }
        return Promise.reject(new Error("race_reject"));
      })
      .catch((e) => {
        if (currentId === latestId) {
          throw e;
        }
        return Promise.reject(new Error("race_reject"));
      });
  };
}
```
