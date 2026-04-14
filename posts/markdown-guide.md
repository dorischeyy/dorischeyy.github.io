# Markdown 写作备忘录

写博客用 Markdown，整理一份自用参考，方便查。

## 标题

```markdown
## 二级标题
### 三级标题
```

二级标题会在右侧目录中显示，三级标题缩进显示。

## 文本

```markdown
**加粗**  _斜体_  ~~删除线~~
```

**加粗**  _斜体_  ~~删除线~~

## 列表

无序列表：

```markdown
- 第一项
- 第二项
  - 嵌套
```

有序列表：

```markdown
1. 第一步
2. 第二步
3. 第三步
```

## 引用

```markdown
> 这是一段引用文字。
```

> 这是一段引用文字。适合摘录、备注或强调某段内容。

## 代码

行内代码：\`console.log('hello')\`

代码块（指定语言）：

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`
}
```
````

```javascript
function greet(name) {
  return `Hello, ${name}!`
}
```

## 表格

```markdown
| 列一 | 列二 | 列三 |
|------|------|------|
| A    | B    | C    |
| D    | E    | F    |
```

| 列一 | 列二 | 列三 |
|------|------|------|
| A    | B    | C    |
| D    | E    | F    |

## 链接与图片

```markdown
[链接文字](https://example.com)
![图片描述](./image.png)
```

## 分割线

```markdown
---
```

---

就这些，够用了。
