import { IOrderViewContext } from "@/app/(platform)/commerce/cetaphil/page";
import { createContext } from "react";

export const OrderViewContext = createContext<IOrderViewContext>({} as IOrderViewContext);