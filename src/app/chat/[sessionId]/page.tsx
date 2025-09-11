import ChatUI from "@/components/ChatUI";

export default function ChatPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const { sessionId } = params;
  return (
    <div className="w-full">
      <ChatUI sessionId={sessionId} />
    </div>
  );
}
