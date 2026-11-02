import { IOrderViewContext } from "@/app/(platform)/comercio/cetaphil/page";
import { createContext } from "react";

export const OrderViewContext = createContext<IOrderViewContext>({} as IOrderViewContext);