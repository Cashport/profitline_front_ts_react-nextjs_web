import { ChatCircleDots, MagnifyingGlass } from "@phosphor-icons/react";
import { Pagination } from "antd";
import { cn, formatChatDate } from "@/utils/utils";
import { Input } from "@/modules/chat/ui/input";
import { Separator } from "@/modules/chat/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/modules/chat/ui/tabs";

import { Badge } from "@/modules/chat/ui/badge";
import { Avatar, AvatarFallback } from "@/modules/chat/ui/avatar";
import { Checkbox } from "@/modules/chat/ui/checkbox";
import { type Conversation } from "@/modules/chat/lib/mock-data";
import ChatActions from "@/modules/chat/components/chat-actions";
import { Scroll } from "@/components/ui/scroll";

interface AllChatsProps {
  query: string;
  onQueryChange: (query: string) => void;
  activeTab: "todos" | "abiertos" | "cerrados";
  onActiveTabChange: (tab: "todos" | "abiertos" | "cerrados") => void;
  conversations: Conversation[];
  loading: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  activeConversationId?: string;
  onConversationClick: (id: string) => void;
  unreadTicketIds: Set<string>;
  onMarkAsRead: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  pagination?: { limit: number; total: number };
  onNewChat: () => void;
  onAddClient: () => void;
  onAccountStatement?: () => void;
}

function getRiskColors(days: number) {
  if (days <= 0) return { bg: "#F7F7F7", text: "#141414", border: "#DDDDDD", label: "Al día" };
  if (days <= 7)
    return { bg: "#EAF6B1", text: "#141414", border: "#DDE78F", label: `${days} días` };
  if (days <= 30)
    return { bg: "#FDE68A", text: "#141414", border: "#FACC15", label: `${days} días` };
  return { bg: "#FCA5A5", text: "#141414", border: "#F87171", label: `${days} días` };
}

export default function AllChats({
  query,
  onQueryChange,
  activeTab,
  onActiveTabChange,
  conversations,
  loading,
  selectedIds,
  onToggleSelect,
  activeConversationId,
  onConversationClick,
  unreadTicketIds,
  onMarkAsRead,
  page,
  onPageChange,
  pagination,
  onNewChat,
  onAddClient,
  onAccountStatement
}: AllChatsProps) {
  return (
    <aside
      className="border-r md:col-span-3 overflow-hidden min-h-0 flex flex-col"
      style={{ borderColor: "#DDDDDD" }}
    >
      <div
        className="flex items-center justify-between px-5 py-5 pb-0"
        style={{ borderColor: "#DDDDDD" }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 600 }}>Chats</h2>
        <ChatActions
          items={[
            { key: "new-chat", label: "Nuevo chat", onClick: onNewChat },
            { key: "add-client", label: "Agregar cliente", onClick: onAddClient },
            { key: "account-statement", label: "Estado de cuenta", onClick: onAccountStatement }
          ]}
        />
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cliente, teléfono o mensaje..."
            className="w-full bg-[#F7F7F7] pl-8"
            style={{ borderColor: "#DDDDDD" }}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => onActiveTabChange(v as typeof activeTab)}
        className="w-full px-3 pt-2"
      >
        <TabsList className="grid w-full grid-cols-3 bg-[#F7F7F7]">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="abiertos">Abiertos</TabsTrigger>
          <TabsTrigger value="cerrados">Cerrados</TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator className="my-2" />

      <Scroll className="min-h-0 flex-1">
        <ul className="pl-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando tickets...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">No se encontraron tickets</div>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              const isSelected = selectedIds.includes(c.id);
              const risk = getRiskColors(c.overdueDays);
              return (
                <li
                  key={c.id}
                  className={cn(
                    "group relative flex w-full min-w-0 cursor-pointer items-start gap-3 rounded-md px-3 py-3",
                    isActive ? "bg-[#F7F7F7]" : "hover:bg-[#F7F7F7]"
                  )}
                  onClick={() => {
                    onConversationClick(c.id);
                    onMarkAsRead(c.id);
                  }}
                >
                  <Checkbox
                    className="absolute left-2 top-1/2 -translate-y-1/2"
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(c.id)}
                    aria-label={"Seleccionar chat de " + c.customer}
                  />
                  <Avatar className="ml-6 h-9 w-9 border" style={{ borderColor: "#DDDDDD" }}>
                    <AvatarFallback>{c.initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex w-full items-baseline gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {c.client_name}
                      </p>
                      <span className="shrink-0 w-12 md:w-14 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatChatDate(c.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-[11px] font-normal w-fit">{c.customer}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          "truncate text-sm text-muted-foreground",
                          c.hasUnreadUpdate && "font-semibold text-[#141414]"
                        )}
                      >
                        {c.lastMessage}
                      </p>

                      {c.hasUnreadUpdate ? (
                        <ChatCircleDots
                          className="w-5 h-5 min-w-[20px] shrink-0"
                          color="#CBE71E"
                          weight="duotone"
                        />
                      ) : null}
                    </div>
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
            })
          )}
        </ul>
      </Scroll>

      {conversations.length > 0 && pagination && (
        <Pagination
          current={page}
          pageSize={pagination.limit}
          total={pagination.total}
          onChange={(newPage) => onPageChange(newPage)}
          showSizeChanger={false}
          size="small"
          className="!py-2 flex justify-center border-t"
          style={{ borderColor: "#DDDDDD" }}
        />
      )}
    </aside>
  );
}
