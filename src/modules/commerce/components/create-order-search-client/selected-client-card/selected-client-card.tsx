import { MapPin } from "lucide-react";

import { ISelectedAddress } from "../types";
import { IEcommerceClient } from "@/types/commerce/ICommerce";

interface ISelectedClientCardProps {
  client: IEcommerceClient;
  address: ISelectedAddress | null;
  nit: string;
}

// Card: Cliente seleccionado
function SelectedClientCard({ client, address, nit }: ISelectedClientCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#DDDDDD] p-5 flex flex-col gap-3">
      <p className="text-xs font-medium text-[#999999]">Cliente seleccionado</p>
      <div>
        <p className="text-base font-bold text-[#141414] leading-tight">{client.client_name}</p>
        <p className="text-xs text-[#999999] mt-0.5">NIT: {nit}</p>
      </div>
      {address && (
        <div className="flex items-start gap-2">
          <MapPin size={13} className="text-[#999999] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-[#141414]">{address.dispatch_address}</p>
            <p className="text-xs text-[#999999]">{address.city}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectedClientCard;
