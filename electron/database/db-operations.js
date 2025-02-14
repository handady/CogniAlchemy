// electron/database/db-operations.js
const db = require("./db"); // 引入数据库初始化模块中导出的数据库实例
// 如果你使用 TypeScript，则可能需要先编译成 js

// 插入主画布节点
const createGraphNode = (node) => {
  const stmt = db.prepare(`
    INSERT INTO GraphNodes (id, tag, content, color, usage, pos_x, pos_y, state)
    VALUES (@id, @tag, @content, @color, @usage, @pos_x, @pos_y, @state)
  `);
  stmt.run({
    ...node,
    state: JSON.stringify(node.state),
  });
};

// 更新 GraphNode 的状态字段
const updateGraphNodeState = (id, newState) => {
  const stmt = db.prepare(`
    UPDATE GraphNodes
    SET state = @state, updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  stmt.run({ id, state: JSON.stringify(newState) });
};

// 插入边
const createEdge = (edge) => {
  const stmt = db.prepare(`
    INSERT INTO Edges (id, source_node_id, target_node_id, weight)
    VALUES (@id, @source_node_id, @target_node_id, @weight)
  `);
  stmt.run(edge);
};

// 插入内部画布状态（保存 React Flow 状态）
const createInternalCanvasState = (internal) => {
  const stmt = db.prepare(`
    INSERT INTO InternalCanvasState (id, parent_node_id, react_flow_state)
    VALUES (@id, @parent_node_id, @react_flow_state)
  `);
  stmt.run({
    ...internal,
    react_flow_state: JSON.stringify(internal.react_flow_state),
  });
};

// 获取 Graph 数据
const getGraphData = () => {
  // 查询所有节点
  const nodesStmt = db.prepare("SELECT * FROM GraphNodes");
  const nodes = nodesStmt.all().map((node) => ({
    ...node,
    state: JSON.parse(node.state || "{}")
  }));
  
  // 查询所有边
  const edgesStmt = db.prepare("SELECT * FROM Edges");
  const edges = edgesStmt.all();
  
  return { nodes, edges };
};

// 删除node节点以及相关的边
const deleteNode = (nodeId) => {
  const stmt = db.prepare(`
    DELETE FROM GraphNodes WHERE id = @id
  `);
  stmt.run({ id: nodeId });

  const edgesStmt = db.prepare(`
    DELETE FROM Edges WHERE source_node_id = @id OR target_node_id = @id
  `);
  edgesStmt.run({ id: nodeId });
};

module.exports = {
  createGraphNode,
  updateGraphNodeState,
  createEdge,
  createInternalCanvasState,
  getGraphData,
  deleteNode,
};
