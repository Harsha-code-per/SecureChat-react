import type { Message } from "../types/message";

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div style={{ height: "300px", overflowY: "auto", border: "1px solid #ccc" }}>
      {messages.map((msg) => (
        <div key={msg.id}>
          <b>{msg.senderName}:</b> {msg.text}
        </div>
      ))}
    </div>
  );
}
