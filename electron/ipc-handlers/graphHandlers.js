// electron/ipc-handlers/graphHandlers.js
const { ipcMain } = require("electron");
const dbOps = require("../database/db-operations");

// 创建主画布节点
ipcMain.handle("create-graph-node", async (event, nodeData) => {
  try {
    dbOps.createGraphNode(nodeData);
    return { success: true };
  } catch (error) {
    console.error("createGraphNode error:", error);
    return { success: false, message: error.message };
  }
});

// 更新主画布节点状态
ipcMain.handle("update-graph-node-state", async (event, { id, newState }) => {
  try {
    dbOps.updateGraphNodeState(id, newState);
    return { success: true };
  } catch (error) {
    console.error("updateGraphNodeState error:", error);
    return { success: false, message: error.message };
  }
});

// 查询 Graph 数据
ipcMain.handle("get-graph-data", async () => {
  try {
    // 这里假设你已经封装了查询数据的函数，如 getGraphData()
    const data = await dbOps.getGraphData(); // data 应该类似 { nodes: [...], edges: [...] }
    return { success: true, data };
  } catch (error) {
    console.error("getGraphData error:", error);
    return { success: false, message: error.message };
  }
});

// 删除node节点以及相关的边
ipcMain.handle("delete-node", async (event, nodeId) => {
  try {
    dbOps.deleteNode(nodeId);
    return { success: true };
  } catch (error) {
    console.error("deleteNode error:", error);
    return { success: false, message: error.message };
  }
});

// 根据nodeid连接两个节点
ipcMain.handle(
  "connect-nodes",
  async (event, { sourceNodeId, targetNodeId }) => {
    try {
      dbOps.connectNodes(sourceNodeId, targetNodeId);
      return { success: true };
    } catch (error) {
      console.error("connectNodes error:", error);
      return { success: false, message: error.message };
    }
  }
);

// 根据nodeId断开此节点的所有连线
ipcMain.handle("disconnect-node", async (event, nodeId) => {
  try {
    dbOps.disconnectNode(nodeId);
    return { success: true };
  } catch (error) {
    console.error("disconnectNode error:", error);
    return { success: false, message: error.message };
  }
});
