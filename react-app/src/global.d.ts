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
    };
  }
}
