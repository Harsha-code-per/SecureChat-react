import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import ChatRoom from "./components/ChatRoom";
import RoomSelector from "./components/RoomSelector";

export default function App() {
  const { user, loading } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);

  if (loading) return null;
  if (!user) return <p>Auth failed</p>;

  const content = !roomId ? (
    <RoomSelector onJoin={setRoomId} />
  ) : (
    <ChatRoom
      roomId={roomId}
      user={user}
      onLeave={() => setRoomId(null)}
    />
  );

  return (
    <div className="bg-gray-900 text-white flex h-screen items-center justify-center">
      <div className="w-full h-full md:h-[90vh] md:max-h-[700px] md:max-w-4xl bg-gray-800 md:rounded-lg shadow-2xl flex flex-col">
        {content}
      </div>
    </div>
  );
}
