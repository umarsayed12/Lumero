import { auth } from "@/auth";
import Homepage from "@/components/Homepage";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    redirect("/chat");
  }
  return <Homepage />;
}
