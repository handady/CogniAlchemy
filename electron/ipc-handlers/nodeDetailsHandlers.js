const { ipcMain } = require("electron");
const dbNodeDetails = require("../database/db-node-details");

// 获取节点详情
ipcMain.handle("get-node-detail", async (event, nodeId) => {
  try {
    const detail = await dbNodeDetails.getNodeDetail(nodeId);
    return { success: true, detail };
  } catch (error) {
    console.error("getNodeDetail error:", error);
    return { success: false, message: error.message };
  }
});

// 插入节点详情
ipcMain.handle("create-node-detail", async (event, detailData) => {
  try {
    dbNodeDetails.createNodeDetail(detailData);
    return { success: true };
  } catch (error) {
    console.error("createNodeDetail error:", error);
    return { success: false, message: error.message };
  }
});

// 更新节点详情
ipcMain.handle("update-node-detail", async (event, { id, newDetail }) => {
  try {
    dbNodeDetails.updateNodeDetail(id, newDetail);
    return { success: true };
  } catch (error) {
    console.error("updateNodeDetail error:", error);
    return { success: false, message: error.message };
  }
});

// 删除节点详情
ipcMain.handle("delete-node-detail", async (event, id) => {
  try {
    dbNodeDetails.deleteNodeDetail(id);
    return { success: true };
  } catch (error) {
    console.error("deleteNodeDetail error:", error);
    return { success: false, message: error.message };
  }
});
