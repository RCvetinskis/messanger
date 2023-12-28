import { SideBar } from "@/components/sidebar/side-bar";
import { ConversationList } from "./_components/conversation-list";
import { getConversations } from "@/libs/conversation-service";

export default async function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();

  return (
    <SideBar>
      <div className="h-full">
        <ConversationList initialItems={conversations} />
        {children}
      </div>
    </SideBar>
  );
}
