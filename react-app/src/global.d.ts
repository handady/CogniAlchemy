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
      updateTag: (tagId: string, tagData: any) => Promise<any>;
      deleteTag: (tagId: string) => Promise<any>;
    };
  }
}
