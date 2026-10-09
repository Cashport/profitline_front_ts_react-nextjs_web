import React, { createContext, useContext, ReactNode, useCallback } from "react";
import { message } from "antd";
import type { MessageInstance } from "antd/es/message/interface";

type MessageApiType = {
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void;
  // Raw AntD instance for cases showMessage can't cover (duration: 0, keys, dismiss fn).
  // Prefer this over the static `message` from "antd", which ignores every ConfigProvider theme.
  messageApi: MessageInstance;
};
const MessageContext = createContext<MessageApiType | null>(null);
interface MessageProviderProps {
  children: ReactNode;
}

export type MessageType = "success" | "error" | "info" | "warning" | "loading";

export const MessageProvider: React.FC<MessageProviderProps> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = useCallback(
    (type: MessageType, content: string) => {
      messageApi.open({ type, content });
    },
    [messageApi]
  );
  return (
    <MessageContext.Provider value={{ showMessage, messageApi }}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};
export const useMessageApi = (): MessageApiType => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessageApi must be used within a MessageProvider");
  }
  return context;
};
