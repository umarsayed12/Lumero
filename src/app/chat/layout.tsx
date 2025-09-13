import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="w-full flex flex-col items-start">
          <Header />
          <main className="flex-1 w-full overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
