import { MapPin } from "lucide-react";

import { IClientOption, ISelectedAddress } from "../types";

interface ISelectedClientCardProps {
  client: IClientOption;
  address: ISelectedAddress | null;
}

// Card: Cliente seleccionado (mock display)
function SelectedClientCard({ client, address }: ISelectedClientCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#DDDDDD] p-5 flex flex-col gap-3">
      <p className="text-xs font-medium text-[#999999]">Cliente seleccionado</p>
      <div>
        <p className="text-base font-bold text-[#141414] leading-tight">{client.label}</p>
        <p className="text-xs text-[#999999] mt-0.5">NIT: 900.123.456-7</p>
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
