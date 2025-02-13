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
