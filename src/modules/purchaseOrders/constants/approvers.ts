export interface Approver {
  id: string;
  name: string;
  role: string;
}

export const availableApprovers: Approver[] = [
  { id: "1", name: "Miguel Martínez", role: "KAM" },
  { id: "2", name: "Ana García", role: "Cartera" },
  { id: "3", name: "Carlos López", role: "Financiera" },
  { id: "4", name: "Laura Rodríguez", role: "Gerente" }
];
