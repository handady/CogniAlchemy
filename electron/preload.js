// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  createGraphNode: (nodeData) =>
    ipcRenderer.invoke("create-graph-node", nodeData),
  updateGraphNodeState: (id, newState) =>
    ipcRenderer.invoke("update-graph-node-state", { id, newState }),
  // 你可以继续添加其它接口，例如：
  createEdge: (edgeData) => ipcRenderer.invoke("create-edge", edgeData),
  createInternalCanvas: (internalData) =>
    ipcRenderer.invoke("create-internal-canvas", internalData),
  getGraphData: () => ipcRenderer.invoke("get-graph-data"),
  deleteNode: (nodeId) => ipcRenderer.invoke("delete-node", nodeId),
  connectNodes: (sourceNodeId, targetNodeId) =>
    ipcRenderer.invoke("connect-nodes", { sourceNodeId, targetNodeId }),
  getTags: () => ipcRenderer.invoke("get-tags"),
  createTag: (tag) => ipcRenderer.invoke("create-tag", tag),
  updateTag: (tag) => ipcRenderer.invoke("update-tag", tag),
  deleteTag: (tagId) => ipcRenderer.invoke("delete-tag", tagId),
});

window.addEventListener("DOMContentLoaded", () => {
  // 你可以在这里预加载其他 API 或进行初始化操作
});
