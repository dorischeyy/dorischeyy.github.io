# 我的博客

纯静态个人博客，部署于 GitHub Pages。

## 本地预览

因为用了 `fetch()` 加载本地文件，直接双击打开 html 会遇到跨域限制。需要起一个本地服务器：

```bash
# Python（推荐）
cd ~/Documents/my-blog
python3 -m http.server 8080
# 然后访问 http://localhost:8080
```

## 发布到 GitHub Pages

1. 在 GitHub 新建一个仓库（如 `my-blog`）
2. 将本目录推送到该仓库的 `main` 分支：
   ```bash
   cd ~/Documents/my-blog
   git init
   git add .
   git commit -m "init blog"
   git remote add origin https://github.com/你的用户名/my-blog.git
   git push -u origin main
   ```
3. 仓库 → Settings → Pages → Source 选 `main` 分支 → Save
4. 几分钟后访问 `https://你的用户名.github.io/my-blog/`

## 配置评论系统（Giscus）

1. 在仓库 Settings → Features 中开启 **Discussions**
2. 访问 [giscus.app](https://giscus.app)，填入你的仓库名，获取配置参数
3. 编辑 `js/app.js` 顶部的 `CONFIG.giscus`，填入你的参数：
   ```js
   giscus: {
     repo:       'your-username/my-blog',
     repoId:     '从 giscus.app 复制',
     category:   'Announcements',
     categoryId: '从 giscus.app 复制',
   }
   ```

## 写文章

1. 在 `posts/` 目录新建 `your-slug.md`（slug 只用英文和连字符）
2. 在 `posts/index.json` 中添加一条记录：
   ```json
   {
     "slug": "your-slug",
     "title": "文章标题",
     "date": "2026-04-14",
     "tags": ["标签一", "标签二"],
     "excerpt": "文章摘要，显示在列表页。"
   }
   ```
3. Push 到 GitHub，自动发布

## 修改博客名和简介

编辑 `js/app.js` 顶部：
```js
const CONFIG = {
  blogName: '我的博客',   // 修改为你的博客名
  blogDesc: '记录想法与生活',
  ...
}
```

同步修改三个 html 文件中 `<title>` 标签和 `.nav-logo` 的文字。
