# [悠享退休 - 法定退休年龄计算器](https://retire-plan.gandli.eu.org/)

## 介绍

悠享退休是一个用于计算退休年龄和退休信息的应用程序。用户只需输入出生年份、出生月份以及性别类型，即可获取改革后的法定退休年龄、退休日期及相关信息。

## 特性

- 输入出生年份和月份
- 选择性别类型
- 计算原退休年龄和改革后的退休信息
- 提供流式交互响应

## 技术栈

- **前端**: Next.js 14
- **后端**: OpenAI API
- **样式**: Tailwind CSS
- **构建工具**: Vercel

## 安装和运行

### 1. 克隆项目

```bash
git clone <你的项目仓库链接>
cd retirement-planner
```

### 2. 安装依赖

```bash
npm install
```

### 3. 设置环境变量

在项目根目录下创建一个 `.env` 文件，并添加以下内容：

```
ZHIPUAI_API_KEY=<你的API密钥>
ZHIPUAI_API_BASEURL=<你的API基础URL>
ZHIPUAI_MODEL_ID=<你的模型ID>
```

### 4. 运行开发服务器

```bash
npm run dev
```

打开浏览器，访问 `http://localhost:3000`。

## 使用说明

1. 输入出生年份和出生月份。
2. 从下拉菜单中选择性别类型。
3. 系统将自动计算并展示退休信息，包括原退休年龄、改革后退休年龄、退休时间和延迟月数。

## 部署

应用已部署在 Vercel 上，访问 [悠享退休](https://你的项目链接) 查看实时演示。

## 贡献

欢迎提出问题和提交请求！请查看 [贡献指南](CONTRIBUTING.md) 以了解更多信息。

## 许可证

本项目使用 MIT 许可证，详情请参见 [LICENSE](LICENSE) 文件。