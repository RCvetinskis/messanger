import { SideBar } from "@/components/sidebar/side-bar";
import { ConversationList } from "./_components/conversation-list";
import { getConversations } from "@/libs/conversation-service";
import { getUsers } from "@/libs/user-service";

export default async function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    <SideBar>
      <div className="h-full">
        <ConversationList users={users} initialItems={conversations} />
        {children}
      </div>
    </SideBar>
  );
}
