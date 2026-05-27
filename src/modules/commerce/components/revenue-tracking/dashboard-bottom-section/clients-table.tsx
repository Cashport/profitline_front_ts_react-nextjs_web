import { Eye } from "lucide-react";

export function ClientsTable() {
  const orders = [
    {
      id: "ORD-7241",
      client: "Sociedad Integral de Especialistas",
      status: "Entregado",
      date: "17 Abr 2026",
      value: "$ 1.240.500",
      units: 12
    },
    {
      id: "ORD-9102",
      client: "Grupo Afin Farmaceutica",
      status: "En tránsito",
      date: "16 Abr 2026",
      value: "$ 850.300",
      units: 8
    },
    {
      id: "ORD-8823",
      client: "Droguerías Cruz Verde",
      status: "Entregado",
      date: "15 Abr 2026",
      value: "$ 2.100.000",
      units: 24
    },
    {
      id: "ORD-6544",
      client: "Vidamedical Bogota",
      status: "Pendiente",
      date: "15 Abr 2026",
      value: "$ 420.700",
      units: 4
    },
    {
      id: "ORD-5432",
      client: "Helpharma S.A.S.",
      status: "Entregado",
      date: "14 Abr 2026",
      value: "$ 957.095",
      units: 10
    },
    {
      id: "ORD-3211",
      client: "Virrey Solis IPS SA",
      status: "Cancelado",
      date: "14 Abr 2026",
      value: "$ 0",
      units: 0
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Entregado":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "En tránsito":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Pendiente":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "Cancelado":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 min-h-[450px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Order Details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Nivel de detalle por transacción en tiempo real
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto no-scrollbar sm:scrollbar-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-muted-foreground bg-secondary border-b border-border tracking-wider">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-tl-lg">Order ID</th>
              <th className="px-4 py-3 font-semibold">Nombre Cliente</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Fecha creación</th>
              <th className="px-4 py-3 font-semibold text-right">Valor del pedido</th>
              <th className="px-4 py-3 font-semibold text-center">Unidades</th>
              <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order, i) => (
              <tr key={i} className="hover:bg-muted transition-colors group">
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">{order.id}</td>
                <td className="px-4 py-4 font-medium text-foreground relative group/name max-w-[200px]">
                  <div className="truncate cursor-default">{order.client}</div>
                  <div className="absolute left-4 top-full mt-1 hidden group-hover/name:block z-50 pointer-events-none">
                    <div className="bg-popover text-popover-foreground text-xs px-2.5 py-1.5 rounded-lg shadow-xl border border-border whitespace-nowrap animate-in fade-in zoom-in-95 duration-200">
                      {order.client}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)} tracking-tighter`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-center text-muted-foreground">{order.date}</td>
                <td className="px-4 py-4 text-right font-bold text-foreground tabular-nums">
                  {order.value}
                </td>
                <td className="px-4 py-4 text-center text-muted-foreground tabular-nums">
                  {order.units}
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
