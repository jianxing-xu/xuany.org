---
title: "Git Merge 与 Rebase 的对比与最佳实践"
description: "详细介绍 Git Merge 和 Rebase 的区别,以及它们各自的使用场景"
pubDate: "2024-01-20"
heroImage: ""
mark: false
---

# Git Merge 与 Rebase 详解

## 基本概念

### Git Merge

Git Merge 是一种将一个分支的更改合并到另一个分支的操作。当执行 merge 时，Git 会:

1. 创建一个新的合并提交(merge commit)
2. 保留两个分支的完整历史记录
3. 形成一个新的合并节点

基本用法:

```bash
git checkout feature-branch
git merge main
```

执行后会生成一个新的合并提交，历史如下：

```
*   c3 (HEAD -> feature-branch) Merge branch 'main' into feature-branch
|\  
| * c2 (main) 新增功能
* | c1 初始提交
```

### Git Rebase

Git Rebase 是另一种集成分支更改的方法。它会将当前分支的提交，"平移"到目标分支的最新提交之后，重写提交历史。

基本用法:

```bash
git checkout feature-branch
git rebase main
```

执行后，feature-branch 的提交会被移动到 main 的最新提交之后，历史如下：

```
* c4 (HEAD -> feature-branch) 新增功能
* c1 (main) 初始提交
```

## 区别对比

| 维度         | Merge                        | Rebase                       |
|--------------|------------------------------|------------------------------|
| 历史记录     | 保留分叉，产生合并节点       | 线性历史，无分叉             |
| 提交数量     | 多一个 merge commit          | 只保留实际提交               |
| 冲突处理     | 合并时一次性解决             | 每步变基都可能遇到冲突       |
| 可读性       | 历史复杂，分支清晰           | 历史简洁，追踪变更更直观     |
| 场景         | 公共分支协作，保留历史       | 个人分支整理，提交更清晰     |

## 使用场景

### 适合使用 Merge 的场景
- 团队协作，多个开发者同时向主分支提交，需保留分支历史。
- 需要追踪分支合并点，便于回溯和审计。
- 重要的 release、hotfix 分支合并。

### 适合使用 Rebase 的场景
- 个人开发者在 feature 分支上开发，想保持提交历史整洁。
- 在合并到主分支前，整理提交顺序，消除无意义的提交。
- 需要 bisect、cherry-pick 等操作时，线性历史更易操作。

## 优缺点总结

**Merge 优点：**
- 保留完整分支历史，便于协作和回溯。
- 合并过程简单，冲突集中处理。

**Merge 缺点：**
- 历史记录分叉，复杂度高。
- 合并提交较多，影响日志可读性。

**Rebase 优点：**
- 历史线性，提交记录简洁。
- 便于代码审查和定位问题。

**Rebase 缺点：**
- 变基会重写历史，不适合已推送到远程的公共分支。
- 多次 rebase 可能导致冲突分散，处理繁琐。

## 最佳实践

1. **公共分支（如 main、develop）优先使用 merge**，避免重写历史。
2. **个人分支、feature 分支可用 rebase 整理提交**，合并前保持历史整洁。
3. **不要对已推送到远程的公共分支 rebase**，否则会导致协作混乱。
4. **遇到复杂冲突时优先 merge**，便于集中解决。

## 总结

- Merge 适合团队协作、保留历史，Rebase 适合个人整理、保持线性。
- 合理选择，结合实际场景，提升协作效率和代码质量。


