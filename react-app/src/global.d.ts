export {};

declare global {
  interface Window {
    electronAPI: {
      createGraphNode: (nodeData: any) => Promise<any>;
      updateGraphNodeState: (id: string, newState: any) => Promise<any>;
      createEdge: (edgeData: any) => Promise<any>;
      createInternalCanvas: (internalData: any) => Promise<any>;
      getGraphData: () => Promise<any>;
      deleteNode: (id: string) => Promise<any>;
      connectNodes: (sourceId: string, targetId: string) => Promise<any>;
      getTags: () => Promise<any>;
      createTag: (tagData: any) => Promise<any>;
      updateTag: (tagData: any) => Promise<any>;
      deleteTag: (tagId: string) => Promise<any>;
      disconnectNode: (nodeId: string) => Promise<any>;
      updateNode: (nodeData: any) => Promise<any>;
      getNodeDetail: (nodeId: string) => Promise<any>;
      updateNodeDetail: (nodeId: string, detail: any) => Promise<any>;
      deleteNodeDetail: (nodeId: string) => Promise<any>;
      createNodeDetail: (detail: any) => Promise<any>;
    };
  }
}
