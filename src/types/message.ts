import { Timestamp } from "firebase/firestore";

export type FirestoreMessage = {
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
};

export type Message = FirestoreMessage & {
  id: string;
};
