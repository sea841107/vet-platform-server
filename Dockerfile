# 使用官方 Node.js 映像
FROM node:16

# 設定工作目錄
WORKDIR /usr/src/app

# 複製 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安裝專案依賴
RUN npm install

# 複製專案的所有內容到工作目錄
COPY . .

# 暴露應用程式運行的端口
EXPOSE 3000

# 定義應用程式的啟動命令
CMD ["npm", "start"]