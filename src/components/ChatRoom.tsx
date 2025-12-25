import { useState } from "react";
import { useMessages } from "../hooks/useMessages";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import VoiceCallPanel from "./VoiceCallPanel";


type Props = {
  roomId: string;
  user: any;
  onLeave: () => void;
};

export default function ChatRoom({ roomId, user, onLeave }: Props) {
  const [name, setName] = useState("Guest");
  const { messages, sendMessage } = useMessages(roomId, user, name);

  return (
    
    <div style={{ padding: 20 }}>
      <h2>Room: {roomId}</h2>

      <button onClick={onLeave}>Leave room</button>

      <div>
        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <VoiceCallPanel roomId={roomId} userId={user.uid} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
