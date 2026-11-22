# 9dots 架构

## 技术栈与入口

9dots 是静态博客，使用 Astro 5.17.3、TypeScript、Astro 组件和 CSS，部署目标是 GitHub Pages。Markdown 由 Astro 的 remark/rehype 管线处理，Shiki 负责代码高亮，MathJax 负责公式，Pagefind 1.6.0 负责全文搜索。依赖和脚本见 `package.json`，版本解析由 `bun.lock` 固定。Astro 集成与 Markdown 插件顺序定义在 `astro.config.ts`，其中设定 `trailingSlash: 'never'`。站点 URL、名称和默认元数据位于 `src/site.config.ts`，`tsconfig.json` 将 `@/*` 映射至 `src/*`。

## 页面与目录

| 路由或路径 | 职责 |
| --- | --- |
| `/` · `src/pages/index.astro` | 通过 `getPosts()` 读取文章，由 `PostIndex.astro` 渲染按最后更新年份分组的文章索引。 |
| `/blog/<id>` · `src/pages/blog/[...id].astro` | `getStaticPaths()` 按文章的集合 ID 生成路径，`render(post)` 将正文传给 `BlogPost.astro`。 |
| `/about` · `src/pages/about/index.astro` | 静态 About 页面，使用共享布局和文章样式。 |
| `src/layouts/BaseLayout.astro` | 共享页面骨架、导航与搜索入口，使用 `BaseHead.astro` 输出 canonical 和社交元数据。 |
| `src/layouts/BlogPost.astro` | 文章标题、日期、正文及 Pagefind 索引标记。 |
| `src/components/Search.astro` | 搜索对话框，按需加载 `pagefind/pagefind.js`。 |
| `src/assets/styles/` | `global.css` 提供全局样式，`minimal.css` 管理站点外壳、索引与搜索，`academic.css` 管理文章和 About 的排版。 |
| `public/` | 原样复制到站点根路径的字体、图标和图片等静态资源。 |

## Markdown 与公式

1. `src/content.config.ts` 通过 Astro Content Collections 的 `glob` 加载 `src/content/blog/**/*.md`。Frontmatter 必填 `title`、`description` 和 `publishDate`，可选 `updatedDate`、`heroImage`、`language`，`draft` 默认是 `false`。两个日期字段使用相同的解析规则，仅含日期的字符串会补齐月份和日期后再解析。
2. `src/utils/posts.ts` 为首页和文章静态路由提供同一份筛选逻辑。`draft: true` 仅在开发环境纳入。文章按最后更新日期降序排序，其次按发布日期降序，再按 ID 升序。`src/utils/publication.ts` 优先取 `updatedDate`，缺省时回退到 `publishDate`，并以 UTC 格式化首页和详情页的显示日期。详情页的 Pagefind 日期跟随显示日期，Open Graph 的 `article:published_time` 仍取 `publishDate`。
3. `src/plugins/remark-math.ts` 注册本地 `math-syntax/` 中的 micromark 分词器和 `mdast-util-math` 的 AST 转换。`$...$` 是行内公式，`$$...$$` 是展示公式。`remark-display-math.ts` 将被解析为行内节点的同一行双美元公式提升为展示块，也处理列表项中的公式。
4. Rehype 依次运行 `rehype-mathjax/svg`（`fontCache: 'local'`）、`rehypeHeadingIds` 和 `rehype-article.ts`。MathJax 构建时输出 SVG，浏览器直接显示生成结果。文章插件跳过 MathJax 子树，为 HTTP(S) 和协议相对链接添加新窗口属性和箭头，并包裹表格。Shiki 使用 GitHub 明暗主题和代码标记转换器，`src/plugins/shiki-custom-transformers.ts` 为代码块添加外层结构。

## 构建、搜索与部署

- `bun install --frozen-lockfile` 安装锁定依赖，`bun run dev` 启动开发服务，`bun run check` 执行 Astro 检查。`bun run build` 依次运行 `astro check`、`astro build`，生成 `dist/`。当前 `package.json` 没有独立测试脚本。
- `src/integrations/pagefind.ts` 在 `astro:build:done` 中读取 `dist/blog/` 下的文章 `index.html`，使用 `data-pagefind-body` 标记索引正文，采用 `zh` 分词并排除 `mjx-container`。索引写入 `dist/pagefind/`。构建完成后用 `bun run preview` 验证搜索。
- `.github/workflows/deploy.yml` 在推送到 `main` 时触发。Ubuntu runner 安装 Bun（`latest`），按锁文件装依赖并构建，上传 `dist/`，随后由独立部署作业发布到 GitHub Pages。
