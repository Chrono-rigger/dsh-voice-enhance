# 上架 dshmarket 市场的 PR 步骤

目标仓库：<https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>

## 一、先决条件（CI 会逐条检查）

- [ ] 你的插件仓库已推送到 GitHub，且**公开**
- [ ] 仓库的 `package.json` 声明了 `dsh.bundle`（本仓库已有）
- [ ] 仓库**创建满 1 天**——刚建好的仓库当天提 PR 会被 CI 挡下（提示 "0.x days old"），等够时间重推即可，不影响结果
- [ ] 仓库打了 **`dsh-plugin`** topic（仓库首页 → 右侧 About 齿轮 → Topics）

## 二、提交文件

在 awesome-dsh-plugin 仓库里新增**一个**文件：

```
data/plugins/<owner>__<repo>.yml
```

例如你的用户名叫 `someone`，文件名就是：

```
data/plugins/someone__dsh-voice-enhance.yml
```

内容用 `catalog/data-plugins.yml`（把里面的 `Chrono-rigger` 换成你的用户名）：

```yaml
url: https://github.com/someone/dsh-voice-enhance
name: someone/dsh-voice-enhance
category: voice
description:
  en: Hold Alt to dictate and insert a cleaned-up transcript, plus a sparkle button that rewrites the composer draft into a clearer prompt.
  zh: 按住 Alt 说话、松开插入修正后的转写文字，输入框旁的星标按钮可把草稿改写成更清晰的提示词。
icon: https://raw.githubusercontent.com/someone/dsh-voice-enhance/main/assets/icon.png
```

**注意**：不要改 README——它们是脚本从 `data/plugins/*.yml` 生成的，手工改会被打回。

## 三、提 PR

最简单的方式（网页版，不用命令行）：

1. 打开 <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>
2. 点 **Add file → Create new file**
3. 文件名填 `data/plugins/<owner>__<repo>.yml`
4. 粘贴上面的 YAML
5. 底部选 **Create a new branch for this commit and start a pull request**
6. 提交 PR，按模板勾选那几项

PR 标题建议：`Add dsh-voice-enhance (voice dictation + prompt enhancement)`

## 四、之后会发生什么

- CI 依次检查：条目数量（≤3）→ `dsh.bundle` → 仓库年龄 ≥1 天 → `awesome-lint` 与站点构建
- 绿了之后**不代表合并**，维护者会实际读你的仓库，核对描述里的每一句话
- 需要修改时会给 PR 打 `held: author` 标签；把修复推到**同一分支**，然后留**一条**评论说明改了什么即可，不用反复推
- 合并后网站自动重建，通常一天内出现在市场和目录站

## 五、描述必须属实（这条最容易被打回）

评审会拿描述对着代码核。所以别写「46 个工具」这种，除非真有。本条目只说了两件属实的事：

1. 按住 Alt 说话、松开插入修正后的文字
2. 星标按钮把草稿改写成更清晰的提示词

这两件事代码里都真实存在（`lib/client.js` 的 Alt 手势与 ✨ 按钮，`lib/index.js` 的 `promptTools/refine`）。**不要**为了好看加「支持 100 种语言」「自动发送消息」之类——前者不存在，后者默认是关的。

## 六、可选但推荐

- **发 npm**：预构建安装可以跳过 `allowBuilds` 构建授权弹窗。发布后 `package.json` 的 `repository` 字段必须指回这个仓库，否则市场关联不上
- **截图**：在仓库根放一个 `screenshots.json`，列出 1–8 张图片的相对路径（PNG/JPG/WebP，必须 GitHub 托管）。不声明也行，市场会从 README 自动抽取
- 目录**只收单个插件，不收纯聚合包**；本插件自己带行为，不受此限
