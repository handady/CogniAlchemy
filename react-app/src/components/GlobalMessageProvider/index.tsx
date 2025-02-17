// GlobalMessageProvider.tsx
import React, { createContext, useContext } from "react";
import { message } from "antd";

// 定义消息实例的类型，直接使用类型别名
type IMessageApi = ReturnType<typeof message.useMessage>[0];

const GlobalMessageContext = createContext<IMessageApi | null>(null);

export const GlobalMessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <GlobalMessageContext.Provider value={messageApi}>
      {contextHolder}
      {children}
    </GlobalMessageContext.Provider>
  );
};

export const useGlobalMessage = (): IMessageApi => {
  const context = useContext(GlobalMessageContext);
  if (!context) {
    throw new Error(
      "useGlobalMessage must be used within a GlobalMessageProvider"
    );
  }
  return context;
};
