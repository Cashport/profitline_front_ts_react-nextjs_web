"use client";

import { useState } from "react";
import { Search, Download, Settings, TrendingUp, TrendingDown } from "lucide-react";

const mockClients = [
  ...Array.from({ length: 15 }).map((_, i) => {
    const isGood = Math.random() > 0.4;
    return {
      name: `Cliente ${i + 1}`,
      ventasMes: (Math.random() * 900 + 100).toFixed(3),
      meta: (Math.random() * 900 + 100).toFixed(3),
      metaPct: isGood
        ? `+${(Math.random() * 20 + 1).toFixed(2)}%`
        : `-${(Math.random() * 20 + 1).toFixed(2)}%`,
      promMensual: (Math.random() * 900 + 100).toFixed(3),
      promMensualPct: isGood
        ? `+${(Math.random() * 15 + 1).toFixed(2)}%`
        : `-${(Math.random() * 15 + 1).toFixed(2)}%`,
      mesAnterior: (Math.random() * 900 + 100).toFixed(3),
      mesAnteriorPct: isGood
        ? `+${(Math.random() * 10 + 1).toFixed(2)}%`
        : `-${(Math.random() * 10 + 1).toFixed(2)}%`,
      ytdAnterior: (Math.random() * 5000 + 1000).toFixed(3),
      ytd: (Math.random() * 6000 + 1000).toFixed(3),
      ytdPct: isGood
        ? `+${(Math.random() * 30 + 1).toFixed(2)}%`
        : `-${(Math.random() * 10 + 1).toFixed(2)}%`
    };
  })
];

export function ClientDetailTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      id="client-detail-section"
      className="bg-card border border-border rounded-xl overflow-hidden mb-8 shadow-sm"
    >
      <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Detalle por Cliente
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-secondary/50 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-48 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary border border-border px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar sm:scrollbar-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-secondary/30 border-b border-border">
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Client
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Ventas Mes
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Meta
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Prom. Mens.
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                Mes Ant.
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                YTD Ant.
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                YTD
              </th>
              <th className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">
                ROI (YTD)
              </th>
              <th className="px-4 py-2.5 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {filteredClients.map((client, i) => {
              const isMetaPositive = client.metaPct.startsWith("+");
              const isYtdPositive = client.ytdPct.startsWith("+");

              return (
                <tr key={i} className="hover:bg-secondary/40 transition-colors group">
                  <td className="px-4 py-2">
                    <span className="text-xs font-semibold text-foreground">{client.name}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-xs font-medium text-foreground tabular-nums">
                      ${client.ventasMes}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-medium text-muted-foreground tabular-nums">
                        ${client.meta}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums ${isMetaPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                      >
                        {client.metaPct}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        ${client.promMensual}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums ${client.promMensualPct.startsWith("+") ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                      >
                        {client.promMensualPct}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        ${client.mesAnterior}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold tabular-nums ${client.mesAnteriorPct.startsWith("+") ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                      >
                        {client.mesAnteriorPct}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      ${client.ytdAnterior}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className="text-xs font-bold text-foreground tabular-nums">
                      ${client.ytd}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={`text-xs font-bold tabular-nums flex items-center justify-end gap-1 ${isYtdPositive ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {isYtdPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {client.ytdPct}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded bg-secondary hover:bg-muted text-foreground transition-colors">
                        <Settings className="w-3 h-3" />
                      </button>
                      <button className="px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-bold transition-colors">
                        DETAILS
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredClients.length === 0 && (
        <div className="p-8 text-center bg-secondary/10">
          <p className="text-xs text-muted-foreground">
            No records found matching &quot;{searchTerm}&quot;
          </p>
        </div>
      )}

      <div className="p-3 border-t border-border bg-secondary/20 flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Showing {filteredClients.length} of {mockClients.length} rows
        </span>
        <div className="flex items-center gap-1">
          <button
            className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-secondary/50 border border-border rounded hover:bg-secondary text-muted-foreground transition-colors disabled:opacity-50"
            disabled
          >
            Prev
          </button>
          <button className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-secondary/50 border border-border rounded hover:bg-secondary text-foreground transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
