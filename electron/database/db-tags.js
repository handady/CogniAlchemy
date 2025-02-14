// db-tags.js
const db = require("./db");

// 新增标签
const createTag = (tag) => {
  const stmt = db.prepare(`
    INSERT INTO Tags (id, label, color)
    VALUES (@id, @label, @color)
  `);
  stmt.run({
    id: tag.id, // 可以使用 uuid 生成
    label: tag.label,
    color: tag.color || "#f5347f",
  });
};

// 获取所有标签
const getTags = () => {
  const stmt = db.prepare("SELECT * FROM Tags");
  return stmt.all();
};

// 更新标签（例如修改标签名称或颜色）
const updateTag = (tag) => {
  const stmt = db.prepare(`
    UPDATE Tags
    SET label = @label, color = @color, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  stmt.run({
    id: tag.id,
    label: tag.label,
    color: tag.color,
  });
};

// 删除标签
const deleteTag = (id) => {
  const stmt = db.prepare(`DELETE FROM Tags WHERE id = ?`);
  stmt.run(id);
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  deleteTag,
};
