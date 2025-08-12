"use client";

import { useMemo, useState } from "react";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Separator } from "@/modules/chat/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";
import { ScrollArea } from "@/modules/chat/ui/scroll-area";
import { Badge } from "@/modules/chat/ui/badge";
import { Avatar, AvatarFallback } from "@/modules/chat/ui/avatar";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { cn } from "@/utils/utils";
import {
  conversationsMock,
  type Conversation,
  formatRelativeTime
} from "@/modules/chat/lib/mock-data";
import ChatThread from "./chat-thread";
import ChatDetails from "./chat-details";
import MassMessageSheet from "./mass-message-sheet";
import { Chat, Funnel, MagnifyingGlass, Users } from "@phosphor-icons/react";

function riskColors(days: number) {
  if (days <= 0) return { bg: "#F7F7F7", text: "#141414", border: "#DDDDDD", label: "Al día" };
  if (days <= 7)
    return { bg: "#EAF6B1", text: "#141414", border: "#DDE78F", label: `${days} días` };
  if (days <= 30)
    return { bg: "#FDE68A", text: "#141414", border: "#FACC15", label: `${days} días` };
  return { bg: "#FCA5A5", text: "#141414", border: "#F87171", label: `${days} días` };
}

export default function ChatInbox() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"todos" | "abiertos" | "cerrados">("todos");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>(conversationsMock[0]?.id ?? "");
  const [massOpen, setMassOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const filtered = useMemo(() => {
    return conversationsMock.filter((c) => {
      const q = query.toLowerCase();
      const matchesQuery =
        c.customer.toLowerCase().includes(q) ||
        c.phone.includes(query) ||
        c.lastMessage.toLowerCase().includes(q);
      const matchesTab =
        activeTab === "todos"
          ? true
          : activeTab === "abiertos"
            ? c.status === "Abierto"
            : c.status === "Cerrado";
      return matchesQuery && matchesTab;
    });
  }, [query, activeTab]);

  const active = useMemo<Conversation | undefined>(
    () => filtered.find((c) => c.id === activeId) ?? filtered[0],
    [filtered, activeId]
  );

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-2 border-b" style={{ borderColor: "#DDDDDD" }}>
        <div className="flex items-center gap-3 px-4 py-3">
          <Chat className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Conversaciones</h1>
          <Badge className="rounded-full bg-[#F7F7F7] text-xs text-[#141414]" variant="secondary">
            WhatsApp
          </Badge>
        </div>
        <div className="ml-auto flex items-center gap-2 px-4">
          <div className="relative hidden md:block">
            <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente, teléfono o mensaje..."
              className="w-[340px] bg-[#F7F7F7] pl-8"
              style={{ borderColor: "#DDDDDD" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2" style={{ borderColor: "#DDDDDD" }}>
            <Funnel className="h-4 w-4" />
            Filtrar
          </Button>
          <Button
            className="gap-2 text-[#141414]"
            style={{ backgroundColor: "#CBE71E" }}
            onClick={() => setMassOpen(true)}
          >
            <Users className="h-4 w-4" />
            Envío masivo
          </Button>
        </div>
      </header>

      <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-12">
        <aside
          className="border-r md:col-span-3 overflow-hidden min-h-0 flex flex-col"
          style={{ borderColor: "#DDDDDD" }}
        >
          <div className="flex items-center gap-2 px-3 py-3 md:hidden">
            <div className="relative flex-1">
              <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                className="bg-[#F7F7F7] pl-8"
                style={{ borderColor: "#DDDDDD" }}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button size="icon" variant="outline" style={{ borderColor: "#DDDDDD" }}>
              <Funnel className="h-4 w-4" />
            </Button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="w-full px-3 pt-2"
          >
            <TabsList className="grid w-full grid-cols-3 bg-[#F7F7F7]">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="abiertos">Abiertos</TabsTrigger>
              <TabsTrigger value="cerrados">Cerrados</TabsTrigger>
            </TabsList>
          </Tabs>
          <Separator className="my-2" />
          <ScrollArea className="min-h-0 h-[calc(100dvh-154px)] md:h-[calc(100dvh-124px)] pr-2">
            <ul className="px-1">
              {filtered.map((c) => {
                const isActive = c.id === active?.id;
                const isSelected = selectedIds.includes(c.id);
                const risk = riskColors(c.overdueDays);
                return (
                  <li
                    key={c.id}
                    className={cn(
                      "group relative flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-md px-3 py-3",
                      isActive ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]"
                    )}
                    onClick={() => setActiveId(c.id)}
                  >
                    <Checkbox
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(c.id)}
                      aria-label={"Seleccionar chat de " + c.customer}
                    />
                    <Avatar className="ml-6 h-9 w-9 border" style={{ borderColor: "#DDDDDD" }}>
                      <AvatarFallback>{c.initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex w-full items-baseline gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                          {c.customer}
                        </p>
                        <span className="shrink-0 w-12 md:w-14 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                          {formatRelativeTime(c.updatedAt)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{c.lastMessage}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge
                          className={cn(
                            "h-5 rounded-full px-2 text-xs",
                            c.status === "Abierto"
                              ? "bg-[#141414] text-white"
                              : "bg-[#F7F7F7] text-[#141414] border border-[#DDDDDD]"
                          )}
                        >
                          {c.status}
                        </Badge>
                        <Badge
                          className="h-5 rounded-full px-2 text-xs"
                          style={{
                            backgroundColor: risk.bg,
                            color: risk.text,
                            border: `1px solid ${risk.border}`
                          }}
                        >
                          {c.overdueDays > 0 ? `Atraso: ${risk.label}` : "Sin atraso"}
                        </Badge>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </aside>

        <section
          className={cn(detailsOpen ? "md:col-span-6" : "md:col-span-9", "min-h-0 flex flex-col")}
        >
          {active ? (
            <ChatThread
              key={active.id}
              conversation={active}
              onSend={(msg) => {
                const conv = conversationsMock.find((c) => c.id === active.id);
                if (conv) {
                  conv.messages.push({
                    id: String(Date.now()),
                    from: "agent",
                    channel: "whatsapp",
                    text: msg,
                    timestamp: new Date().toISOString()
                  });
                  conv.lastMessage = msg;
                  conv.updatedAt = new Date().toISOString();
                }
              }}
              onSendAudio={(audioUrl) => {
                const conv = conversationsMock.find((c) => c.id === active.id);
                if (conv) {
                  conv.messages.push({
                    id: String(Date.now()),
                    from: "agent",
                    channel: "whatsapp",
                    audioUrl,
                    timestamp: new Date().toISOString()
                  });
                  conv.lastMessage = "Nota de voz";
                  conv.updatedAt = new Date().toISOString();
                }
              }}
              onSendEmail={(subject, body) => {
                const conv = conversationsMock.find((c) => c.id === active.id);
                if (conv) {
                  conv.messages.push({
                    id: String(Date.now()),
                    from: "agent",
                    channel: "email",
                    email: { subject, body },
                    timestamp: new Date().toISOString()
                  });
                  conv.lastMessage = `Email: ${subject}`;
                  conv.updatedAt = new Date().toISOString();
                }
              }}
              onShowDetails={() => setDetailsOpen(true)}
              detailsOpen={detailsOpen}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona un chat para ver la conversación
            </div>
          )}
        </section>

        <aside
          className={cn(
            "hidden border-l md:col-span-3 md:block min-h-0 flex flex-col",
            detailsOpen ? "md:block" : "md:hidden"
          )}
          style={{ borderColor: "#DDDDDD" }}
        >
          {active && <ChatDetails conversation={active} onClose={() => setDetailsOpen(false)} />}
        </aside>
      </div>

      <MassMessageSheet
        open={massOpen}
        onOpenChange={setMassOpen}
        selectedCount={selectedIds.length}
        onSend={(payload) => {
          console.log("Envío masivo simulado:", payload, "destinatarios:", selectedIds);
          setMassOpen(false);
        }}
      />
    </div>
  );
}
