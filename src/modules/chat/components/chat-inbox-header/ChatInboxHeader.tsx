import { Chat, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";
import { Badge } from "@/modules/chat/ui/badge";
import { useTranslations } from "use-intl";
import ChatActions from "@/modules/chat/components/chat-actions";

interface ChatInboxHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
  onNewChat: () => void;
  onAddClient: () => void;
  onAccountStatement?: () => void;
  onFilter?: () => void;
  searchPlaceholder?: string;
}

export default function ChatInboxHeader({
  query,
  onQueryChange,
  onNewChat,
  onAddClient,
  onAccountStatement,
  onFilter,
  searchPlaceholder
}: ChatInboxHeaderProps) {
  const t = useTranslations("chat.inboxHeader");
  const tShared = useTranslations("chat.shared");
  const tCommon = useTranslations("common");
  return (
    <header className="flex items-center gap-2 border-b" style={{ borderColor: "#DDDDDD" }}>
      <div className="flex items-center gap-3 px-4 py-3">
        <Chat className="h-5 w-5" />
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <Badge className="rounded-full bg-[#F7F7F7] text-[13px] text-[#141414]" variant="secondary">
          WhatsApp
        </Badge>
      </div>
      <div className="ml-auto flex items-center gap-2 px-4">
        <div className="relative hidden md:block">
          <MagnifyingGlass className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder ?? tShared("searchPlaceholder")}
            className="w-[340px] bg-[#F7F7F7] pl-8"
            style={{ borderColor: "#DDDDDD" }}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <ChatActions
          items={[
            { key: "add-client", label: tShared("addClient"), onClick: onAddClient },
            {
              key: "account-statement",
              label: tShared("accountStatement"),
              onClick: onAccountStatement
            }
          ]}
        />
        <Button
          variant="outline"
          className="gap-2"
          style={{ borderColor: "#DDDDDD" }}
          onClick={onFilter}
        >
          <Funnel className="h-4 w-4" />
          {tCommon("actions.filter")}
        </Button>
        <Button
          className="gap-2 text-[#141414]"
          style={{ backgroundColor: "#CBE71E" }}
          onClick={onNewChat}
        >
          {tShared("newChat")}
        </Button>
      </div>
    </header>
  );
}
