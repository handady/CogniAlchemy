const db = require("./db");

// 插入主画布节点
const createGraphNode = (node) => {
  const stmt = db.prepare(`
    INSERT INTO GraphNodes (id, tag, content, color, usage, pos_x, pos_y, state, created_by, updated_by)
    VALUES (@id, @tag, @content, @color, @usage, @pos_x, @pos_y, @state, @created_by, @updated_by)
  `);
  stmt.run({
    ...node,
    // 将 tag 数组序列化存储，color 直接存储
    tag: JSON.stringify(node.tag),
    color: node.color,
    state: JSON.stringify(node.state),
    created_by: node.created_by || "system",
    updated_by: node.updated_by || "system",
  });
};

// 更新 GraphNode 的状态字段
const updateGraphNodeState = (id, newState, operator = "system") => {
  const stmt = db.prepare(`
    UPDATE GraphNodes
    SET state = @state, updated_at = CURRENT_TIMESTAMP, updated_by = @updated_by
    WHERE id = @id
  `);
  stmt.run({ id, state: JSON.stringify(newState), updated_by: operator });
};

// 插入边（注意，如果需要记录创建人和最近操作人，也需要传入这两个字段）
const createEdge = (edge) => {
  const stmt = db.prepare(`
    INSERT INTO Edges (id, source_node_id, target_node_id, weight, created_by, updated_by)
    VALUES (@id, @source_node_id, @target_node_id, @weight, @created_by, @updated_by)
  `);
  stmt.run({
    ...edge,
    created_by: edge.created_by || "system",
    updated_by: edge.updated_by || "system",
  });
};

// 插入内部画布状态（保存 React Flow 状态）
const createInternalCanvasState = (internal) => {
  const stmt = db.prepare(`
    INSERT INTO InternalCanvasState (id, parent_node_id, react_flow_state, created_by, updated_by)
    VALUES (@id, @parent_node_id, @react_flow_state, @created_by, @updated_by)
  `);
  stmt.run({
    ...internal,
    react_flow_state: JSON.stringify(internal.react_flow_state),
    created_by: internal.created_by || "system",
    updated_by: internal.updated_by || "system",
  });
};

// 获取 Graph 数据
const getGraphData = () => {
  // 查询所有节点
  const nodesStmt = db.prepare("SELECT * FROM GraphNodes");
  const nodes = nodesStmt.all().map((node) => ({
    ...node,
    tag: JSON.parse(node.tag || "[]"),
    state: JSON.parse(node.state || "{}"),
  }));

  // 查询所有标签
  const tagsStmt = db.prepare("SELECT * FROM Tags");
  const tags = tagsStmt.all();

  // 构造一个从 tag id 到标签 label 的映射
  const tagMap = tags.reduce((acc, tag) => {
    acc[tag.id] = tag.label;
    return acc;
  }, {});

  // 对每个节点生成一个新的字段 tagLabels（或覆盖 tag 字段），用于展示标签名称
  const nodesWithLabels = nodes.map((node) => ({
    ...node,
    // 使用 tag 数组中每个标签的 id 在 tagMap 中查找对应 label
    tagLabels: node.tag.map((tagId) => tagMap[tagId] || tagId).join(","),
  }));

  // 查询所有边
  const edgesStmt = db.prepare("SELECT * FROM Edges");
  const edges = edgesStmt.all();

  return { nodes: nodesWithLabels, edges };
};

// 删除 node 节点以及相关的边
const deleteNode = (nodeId) => {
  // 先删除与节点相关的边
  const edgesStmt = db.prepare(`
    DELETE FROM Edges WHERE source_node_id = @id OR target_node_id = @id
  `);
  edgesStmt.run({ id: nodeId });

  // 再删除节点
  const stmt = db.prepare(`
    DELETE FROM GraphNodes WHERE id = @id
  `);
  stmt.run({ id: nodeId });
};

// 根据 nodeId 连接两个节点（同样可以加入操作人记录）
const connectNodes = (sourceNodeId, targetNodeId, operator = "system") => {
  const stmt = db.prepare(`
    INSERT INTO Edges (source_node_id, target_node_id, created_by, updated_by)
    VALUES (@sourceNodeId, @targetNodeId, @created_by, @updated_by)
  `);
  stmt.run({
    sourceNodeId,
    targetNodeId,
    created_by: operator,
    updated_by: operator,
  });
};

// 根据nodeId断开此节点的所有连线
const disconnectNode = (nodeId) => {
  const stmt = db.prepare(`
    DELETE FROM Edges WHERE source_node_id = @id OR target_node_id = @id
  `);
  stmt.run({ id: nodeId });
};

module.exports = {
  createGraphNode,
  updateGraphNodeState,
  createEdge,
  createInternalCanvasState,
  getGraphData,
  deleteNode,
  connectNodes,
  disconnectNode,
};
