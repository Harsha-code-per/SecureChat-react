import { useState } from "react";

type Props = {
  onJoin: (roomId: string) => void;
};

export default function RoomSelector({ onJoin }: Props) {
  const [room, setRoom] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!room.trim()) return;

    // normalize room id
    const roomId = room.trim().toLowerCase();
    onJoin(roomId);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Join or Create Room</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Enter room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
}
