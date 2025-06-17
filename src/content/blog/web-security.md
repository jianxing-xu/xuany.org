---
title: "Web 安全汇总与攻防详解"
description: "Web 安全汇总与攻防详解"
pubDate: "2024-10-20"
heroImage: ""
mark: false
---

# 网络安全汇总

## 1. XSS（跨站脚本攻击）

### What is XSS?

XSS（Cross-Site Scripting）是指攻击者在网页中注入恶意脚本代码，使其在其他用户的浏览器中执行，进而窃取信息、冒充用户操作等。

### XSS 危害

- 窃取用户 Cookie、会话信息
- 伪造页面进行钓鱼
- 操作用户账户、发起恶意请求
- 传播蠕虫病毒

### 简单演示

假设评论区未做过滤，攻击者输入：

```html
<script>
  alert("XSS 攻击");
</script>
```

其他用户访问页面时会弹窗。

### XSS 类型

- **存储型（Server 端）**：恶意脚本被存储在服务器数据库，所有访问者都会被攻击。
- **反射型（Server 端）**：恶意脚本通过 URL 参数等方式临时注入，用户点击恶意链接即被攻击。
- **DOM 型（浏览器端）**：前端 JS 处理不当，直接将用户输入插入页面，导致脚本执行。

### 防御措施

- 对所有用户输入进行转义、过滤（如使用 DOMPurify）
- 使用 CSP（内容安全策略）限制脚本来源
- 禁止在页面中直接插入未处理的用户输入
- HttpOnly、SameSite Cookie 设置

---

## 2. CSRF（跨站请求伪造）

### What is CSRF?

CSRF（Cross-Site Request Forgery）指攻击者诱导已登录用户在不知情的情况下，向受信任网站发起非本意的请求。

### 攻击流程举例

1. 用户登录银行网站，获得 Cookie
2. 未退出登录，访问攻击者网站
3. 攻击者页面自动发起请求：

```html
<img
  src="https://bank.com/transfer?to=attacker&amount=1000"
  style="display:none"
/>
```

4. 银行网站识别到 Cookie，执行转账

### 攻击类型

- GET 型 CSRF
- POST 型 CSRF
- 隐式表单、图片、脚本等多种方式

### CSRF 危害

- 未授权转账、修改资料、发帖等
- 影响用户隐私和资金安全

### 防御 CSRF

- 对敏感操作使用 CSRF Token 验证
- 验证 Referer 或 Origin 头
- 对重要操作要求二次验证（如验证码、密码）
- Cookie 设置 SameSite 属性

---

## 3. iframe 安全

### What is iframe 劫持?

攻击者通过在恶意网站中嵌入目标网站的 iframe，并覆盖透明层诱导用户点击，实现点击劫持（Clickjacking）。

### 预防方案

- 在 HTTP 响应头设置 `X-Frame-Options: DENY` 或 `SAMEORIGIN`
- 使用 CSP 的 `frame-ancestors` 限制可嵌入页面的来源
- 页面内检测是否被嵌入 iframe，并跳出

---

## 4. SQL 注入

### What is SQL 注入?

攻击者通过构造恶意 SQL 语句插入到应用查询中，读取、篡改、删除数据库数据。

### 简单案例

```sql
SELECT * FROM users WHERE username = '$username' AND password = '$password'
```

攻击者输入：`admin' --`，可绕过密码校验。

### 防御措施

- 使用参数化查询、预编译语句（如 PDO、MyBatis）
- 严格校验和过滤用户输入
- 限制数据库账户权限
- 不暴露详细错误信息

---

## 5. OS 命令注入

### What is OS 命令注入?

攻击者将恶意系统命令拼接到应用调用的 shell 命令中，导致服务器被远程控制。

### 案例

```js
const { exec } = require("child_process");
exec("ping " + userInput);
```

攻击者输入：`127.0.0.1 && rm -rf /`

### 防御措施

- 禁止拼接用户输入到系统命令
- 使用白名单、参数校验
- 使用安全 API（如 spawn、execFile）
- 限制应用权限

---

## 6. 请求劫持

### What is 请求劫持?

攻击者通过 DNS 污染、HTTP 劫持、中间人攻击等方式，篡改用户请求或响应内容。

### 危害

- 窃取敏感信息
- 注入广告、恶意代码
- 伪造页面钓鱼

### 防御措施

- 全站启用 HTTPS，防止中间人攻击
- DNSSEC 防止 DNS 污染
- 校验内容完整性（如 SRI）

---

## 7. DDOS（分布式拒绝服务攻击）

### What is DDOS?

攻击者利用大量肉鸡或僵尸网络，向目标服务器发起海量请求，导致服务瘫痪。

### 如何防御

- 部署高防 CDN、WAF
- 限流、限速、验证码
- 分布式架构、弹性扩容
- 监控异常流量，及时响应

---

# 总结

Web 安全攻防是持续的过程，开发者需不断学习新型攻击手法，完善防御体系，保障用户和业务安全。
