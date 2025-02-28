// db-forging.js
const db = require("./db"); // 引入你的数据库实例

// 添加锻造记录
const addForgingRecord = (
  nodeId,
  forgingContent,
  createdBy = "system",
  updatedBy = "system",
  id
) => {
  const insert = db.prepare(
    `INSERT INTO Forging (id, node_id, forging_content, created_by, updated_by)
    VALUES (?, ?, ?, ?, ?)`
  );
  // 使用前端传来的 id
  return insert.run(id, nodeId, forgingContent, createdBy, updatedBy);
};

// 更新锻造记录
const updateForgingRecord = (id, forgingContent, updatedBy) => {
  const update = db.prepare(
    `UPDATE Forging SET forging_content = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?`
  );
  return update.run(forgingContent, updatedBy, id);
};

// 查找单个锻造记录
const getForgingRecord = (id) => {
  const stmt = db.prepare(`SELECT * FROM Forging WHERE id = ?`);
  return stmt.get(id);
};

// 查找某个节点的所有锻造记录
const getForgingRecordsByNodeId = (nodeId) => {
  const stmt = db.prepare(`SELECT * FROM Forging WHERE node_id = ?`);
  return stmt.all(nodeId);
};

// 删除锻造记录
const deleteForgingRecord = (id) => {
  const del = db.prepare(`DELETE FROM Forging WHERE id = ?`);
  return del.run(id);
};

module.exports = {
  addForgingRecord,
  updateForgingRecord,
  getForgingRecord,
  getForgingRecordsByNodeId,
  deleteForgingRecord,
};
