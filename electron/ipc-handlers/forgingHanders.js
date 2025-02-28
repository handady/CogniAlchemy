// ipcHandler.js
const { ipcMain } = require("electron");
const forgingDb = require("../database/db-forging"); // 引入 db-forging.js

// 处理添加锻造记录的请求
ipcMain.handle(
  "add-forging-record",
  async (event, { nodeId, forgingContent, createdBy, updatedBy, id }) => {
    try {
      const result = forgingDb.addForgingRecord(
        nodeId,
        forgingContent,
        createdBy,
        updatedBy,
        id
      );
      return { success: true, message: "锻造记录添加成功", result };
    } catch (error) {
      console.error("添加锻造记录失败:", error);
      return { success: false, message: "添加锻造记录失败" };
    }
  }
);

// 处理更新锻造记录的请求
ipcMain.handle(
  "update-forging-record",
  async (event, { id, forgingContent, updatedBy }) => {
    try {
      const result = forgingDb.updateForgingRecord(
        id,
        forgingContent,
        updatedBy
      );
      return { success: true, message: "锻造记录更新成功", result };
    } catch (error) {
      console.error("更新锻造记录失败:", error);
      return { success: false, message: "更新锻造记录失败" };
    }
  }
);

// 处理查找单个锻造记录的请求
ipcMain.handle("get-forging-record", async (event, id) => {
  try {
    const record = forgingDb.getForgingRecord(id);
    if (record) {
      return { success: true, record };
    } else {
      return { success: false, message: "没有找到该锻造记录" };
    }
  } catch (error) {
    console.error("获取锻造记录失败:", error);
    return { success: false, message: "获取锻造记录失败" };
  }
});

// 处理查找某个节点的所有锻造记录的请求
ipcMain.handle("get-forging-records-by-node-id", async (event, nodeId) => {
  try {
    const records = forgingDb.getForgingRecordsByNodeId(nodeId);
    return { success: true, records };
  } catch (error) {
    console.error("获取锻造记录失败:", error);
    return { success: false, message: "获取锻造记录失败" };
  }
});

// 处理删除锻造记录的请求
ipcMain.handle("delete-forging-record", async (event, id) => {
  try {
    const result = forgingDb.deleteForgingRecord(id);
    return { success: true, message: "锻造记录删除成功", result };
  } catch (error) {
    console.error("删除锻造记录失败:", error);
    return { success: false, message: "删除锻造记录失败" };
  }
});
