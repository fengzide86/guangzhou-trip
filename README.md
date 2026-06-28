# 广州及周边 12 天旅行计划

ZD ❤ 小芽芽 的专属旅行计划

## 在线预览

部署到 GitHub Pages 后访问：`https://你的用户名.github.io/仓库名/`

## 部署到 GitHub Pages 的步骤

### 第一步：创建仓库

1. 登录 GitHub，点击 **New repository**
2. 填写仓库名（如 `guangzhou-trip`）
3. 勾选 **Public**
4. 勾选 **Add a README file**
5. 点击 **Create repository**

### 第二步：上传文件

⚠️ **重要：所有文件必须直接放在仓库根目录，不要创建文件夹！**

需要上传的文件列表：

```
index.html
style.css
data.js
utils.js
storage.js
animations.js
renderer.js
map.js
expense.js
router.js
app.js
```

上传方法：
1. 在仓库页面点击 **Add file** → **Upload files**
2. 把上面列出的所有文件拖进去
3. 点击 **Commit changes**

### ❌ 错误示例（不要这样做）

```
仓库根目录/
├── css/
│   ── style.css      ← 不要放在文件夹里！
├── js/
│   ├── app.js         ← 不要放在文件夹里！
│   └── ...
└── index.html
```

### ✅ 正确示例

```
仓库根目录/
├── index.html
├── style.css
├── app.js
├── data.js
├── utils.js
├── storage.js
├── animations.js
├── renderer.js
├── map.js
├── expense.js
└── router.js
```

### 第三步：开启 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. Source 选择 **main** 分支
3. 点击 **Save**
4. 等待几分钟，访问 `https://你的用户名.github.io/仓库名/`

## 功能说明

### 行程页面
- 住宿信息、行程日历、强度图表、每日计划
- 点击路线地点可弹出地图弹窗
- 回到顶部按钮

### 地图页面
- 地点选择器，点击卡片查看地图位置
- 支持添加/删除自定义地点
- 高德地图导航按钮

### 费用计算
- 亲属卡支出：zd出70%，yy出30%
- 一般支出：zd出60%，yy出40%
- yy可设置预期金额，低于实际金额时只出预期的比例
- 类目管理（增删改）
- 数据持久化 + 导出明细

### 提醒页面
- 天气判断、提前确认、随身物品、执行原则

## 技术栈

- HTML5 + CSS3 + JavaScript（纯前端，无需后端）
- Leaflet.js（地图）
- Lucide Icons（图标）
- localStorage（数据持久化）