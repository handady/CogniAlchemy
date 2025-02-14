const { ipcMain } = require("electron");
const dbTags = require("../database/db-tags");

// 获取所有标签
ipcMain.handle("get-tags", async () => {
  try {
    const tags = await dbTags.getTags();
    return { success: true, tags };
  } catch (error) {
    console.error("getTags error:", error);
    return { success: false, message: error.message };
  }
});

// 新增标签
ipcMain.handle("create-tag", async (event, tag) => {
  try {
    dbTags.createTag(tag);
    return { success: true };
  } catch (error) {
    console.error("createTag error:", error);
    return { success: false, message: error.message };
  }
});

// 更新标签
ipcMain.handle("update-tag", async (event, tag) => {
  try {
    dbTags.updateTag(tag);
    return { success: true };
  } catch (error) {
    console.error("updateTag error:", error);
    return { success: false, message: error.message };
  }
});

// 删除标签
ipcMain.handle("delete-tag", async (event, tagId) => {
  try {
    dbTags.deleteTag(tagId);
    return { success: true };
  } catch (error) {
    console.error("deleteTag error:", error);
    return { success: false, message: error.message };
  }
});
