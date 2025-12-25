import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firestore";
import type { Message, FirestoreMessage } from "../types/message";

export const useMessages = (
  roomId: string,
  user: any,
  userName: string
) => {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, "chat-rooms", roomId, "messages"),
      orderBy("timestamp")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as FirestoreMessage;

        return {
          id: doc.id,
          ...data,
        };
      });

      setMessages(msgs);
    });

    return () => unsub();
  }, [roomId]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user) return;

    const payload: FirestoreMessage = {
      text,
      senderId: user.uid,
      senderName: userName,
      timestamp: serverTimestamp() as any,
    };

    await addDoc(
      collection(db, "chat-rooms", roomId, "messages"),
      payload
    );
  };

  return { messages, sendMessage };
};
