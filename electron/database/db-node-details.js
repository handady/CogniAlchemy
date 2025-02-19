// db-node-details.js
const db = require("./db");

// 插入节点详情
const createNodeDetail = (detailData) => {
  const stmt = db.prepare(`
    INSERT INTO NodeDetails (id, node_id, detail, created_by, updated_by)
    VALUES (@id, @node_id, @detail, @created_by, @updated_by)
  `);
  stmt.run({
    id: detailData.id, // 例如使用 uuid 生成
    node_id: detailData.node_id,
    detail: detailData.detail, // 可以是 Markdown 文本或 JSON 字符串
    created_by: detailData.created_by || "system",
    updated_by: detailData.updated_by || "system",
  });
};

// 更新节点详情
const updateNodeDetail = (id, newDetail, operator = "system") => {
  const stmt = db.prepare(`
    UPDATE NodeDetails
    SET detail = @detail,
        updated_at = CURRENT_TIMESTAMP,
        updated_by = @updated_by
    WHERE id = @id
  `);
  stmt.run({
    id,
    detail: newDetail,
    updated_by: operator,
  });
};

// 根据 node_id 获取节点详情（假设每个节点只有一条详情记录）
const getNodeDetail = (node_id) => {
  const stmt = db.prepare(`
    SELECT * FROM NodeDetails WHERE node_id = ?
  `);
  return stmt.get(node_id);
};

// 删除节点详情
const deleteNodeDetail = (id) => {
  const stmt = db.prepare(`DELETE FROM NodeDetails WHERE id = ?`);
  stmt.run(id);
};

module.exports = {
  createNodeDetail,
  updateNodeDetail,
  getNodeDetail,
  deleteNodeDetail,
};
