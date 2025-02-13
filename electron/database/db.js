const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

// 创建 data 目录，如果不存在的话
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 数据库文件放在当前目录下的 data 文件夹内
const dbPath = path.join(dataDir, "knowledge.db");
const db = new Database(dbPath);

// 1. 创建 GraphNodes 表
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS GraphNodes (
    id TEXT PRIMARY KEY,
    tag TEXT,
    content TEXT,         -- 节点主要内容（例如描述或 Markdown 文本）
    color TEXT,
    usage REAL,
    pos_x REAL,           -- 节点在主画布上的 x 坐标（可选）
    pos_y REAL,           -- 节点在主画布上的 y 坐标（可选）
    state TEXT,           -- 以 JSON 格式保存的节点状态信息（如显示设置、折叠状态等）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`
).run();

// 2. 创建 Edges 表
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS Edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT,
    target_node_id TEXT,
    weight REAL,          -- 边的权重或强度
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_node_id) REFERENCES GraphNodes(id),
    FOREIGN KEY (target_node_id) REFERENCES GraphNodes(id)
  );
`
).run();

// 3. 创建 InternalCanvasState 表
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS InternalCanvasState (
    id TEXT PRIMARY KEY,
    parent_node_id TEXT,           -- 对应 GraphNodes 中的节点ID，表示此内部画布属于哪个主节点
    react_flow_state TEXT,         -- 保存 React Flow 状态的 JSON 字符串（包括 nodes、edges、viewport 等）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_node_id) REFERENCES GraphNodes(id)
  );
`
).run();

// 导出数据库实例和一些简单的操作函数
module.exports = db;
