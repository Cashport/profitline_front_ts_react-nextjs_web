// Estilos de los pills de rol del Market Admin.
// Las llaves son los role_name que devuelve el backend; las que no coincidan
// caen al gris por defecto del consumidor.

export const ROL_STYLES: Record<string, string> = {
  Admin: "bg-[#141414] text-white",
  Supervisor: "bg-[#E8F0FF] text-[#2252CC]",
  Comprador: "bg-[#F0F0F0] text-[#666666]"
};
