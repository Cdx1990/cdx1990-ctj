# 楚天镜 - 可编辑预览页

本项目为一个可外部部署的静态网页。仅允许账户 `qazwsx1995` 登录。登录后可在页面中进行编辑，内容保存于浏览器本地（localStorage），支持导入/导出与重置。

## 预览方式
- 方式一：直接双击打开 `index.html`（部分浏览器的本地文件安全策略可能限制导入/导出功能）。
- 方式二：开启本地静态服务（推荐）：
  ```bash
  cd /workspace/chutianjing-web
  python3 -m http.server 8080
  # 浏览器访问 http://localhost:8080
  ```

## Docker 部署
构建镜像并运行：
```bash
cd /workspace/chutianjing-web
docker build -t chutianjing-web:latest .
# 前台运行，端口映射至 8080
docker run --rm -p 8080:80 chutianjing-web:latest
# 浏览器访问 http://localhost:8080
```

## 使用说明
- 登录：用户名输入 `qazwsx1995`，密码可留空（仅前端校验）。
- 编辑模式：右上角切换“编辑模式”后，页面中标注可编辑区域会出现虚线高亮，直接修改即可。
- 保存：自动保存（输入后约 600ms）或点击“保存”。
- 导出：点击“导出JSON”下载当前页面内容。
- 导入：点击“导入JSON”选择导出的 JSON 文件即可恢复。
- 重置为默认：清空本地保存并恢复默认内容。
- 登出：清空会话并回到登录页。

## 注意
- 本示例为前端静态页面，不包含服务端认证。请勿用于生产环境的真实认证场景。
- 浏览器隐私模式或清理站点数据会导致本地保存的内容被清空。