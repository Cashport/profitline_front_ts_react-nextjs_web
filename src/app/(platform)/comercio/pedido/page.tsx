"use client";
import CreateOrderView from "@/modules/commerce/containers/create-order/create-order";
import { MessageProvider } from "@/context/MessageContext";

function Page() {
  return (
    <MessageProvider>
      <CreateOrderView />
    </MessageProvider>
  );
}

export default Page;
