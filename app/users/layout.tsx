import { getUsers } from "@/libs/user-service";
import { SideBar } from "@/components/sidebar/side-bar";
import { UsersList } from "./_components/users-list";
export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();

  return (
    <SideBar>
      <div className="h-full">
        <UsersList items={users} />
        {children}
      </div>
    </SideBar>
  );
}
