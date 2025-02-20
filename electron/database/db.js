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

try{

// 1. 创建 GraphNodes 表，新增 created_by 和 updated_by 字段
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
    state TEXT,           -- 存储节点详情的id
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,      -- 创建人
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT       -- 最近操作人
  );
`
).run();

// 2. 创建 Edges 表，新增 created_by 和 updated_by 字段
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS Edges (
    id TEXT PRIMARY KEY,
    source_node_id TEXT,
    target_node_id TEXT,
    weight REAL,          -- 边的权重或强度
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,      -- 创建人
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,      -- 最近操作人
    FOREIGN KEY (source_node_id) REFERENCES GraphNodes(id),
    FOREIGN KEY (target_node_id) REFERENCES GraphNodes(id)
  );
`
).run();

// 3. 创建 InternalCanvasState 表，新增 created_by 和 updated_by 字段
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS InternalCanvasState (
    id TEXT PRIMARY KEY,
    parent_node_id TEXT,           -- 对应 GraphNodes 中的节点ID，表示此内部画布属于哪个主节点
    react_flow_state TEXT,         -- 保存 React Flow 状态的 JSON 字符串（包括 nodes、edges、viewport 等）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,               -- 创建人
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT,               -- 最近操作人
    FOREIGN KEY (parent_node_id) REFERENCES GraphNodes(id)
  );
`
).run();

// 新建 Tags 表，用于存储所有标签选项
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS Tags (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    color TEXT DEFAULT '#f5347f', -- 如果需要可以存储每个标签对应的默认颜色
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`
).run();

// 创建nodeDetails表
db.exec(`
  -- 创建 NodeDetails 表
  CREATE TABLE IF NOT EXISTS NodeDetails (
    id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,  -- 对应 GraphNodes 表中的节点 id
    detail TEXT,            -- 详细信息，比如 Markdown 文本、JSON 数据等
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    FOREIGN KEY (node_id) REFERENCES GraphNodes(id) ON DELETE CASCADE
  );
  
  -- 为 node_id 添加索引，加速查询
  CREATE INDEX IF NOT EXISTS idx_node_details_node_id ON NodeDetails(node_id);
  
  -- 创建触发器，在更新时自动更新 updated_at 字段
  CREATE TRIGGER IF NOT EXISTS trg_update_NodeDetails_updated_at
  AFTER UPDATE ON NodeDetails
  FOR EACH ROW
  BEGIN
    UPDATE NodeDetails
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.id;
  END;
`);
}catch(e){
  console.log(e);
}

// 导出数据库实例和一些简单的操作函数
module.exports = db;
