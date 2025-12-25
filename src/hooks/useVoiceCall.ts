import { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firestore";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const useVoiceCall = (roomId: string, userId: string) => {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const pendingIceCandidates = useRef<RTCIceCandidateInit[]>([]);

  type CallStatus = "idle" | "ringing" | "connected";

const [callStatus, setCallStatus] = useState<CallStatus>("idle");
const [isMuted, setIsMuted] = useState(false);
const toggleMute = () => {
  if (!localStreamRef.current) return;

  localStreamRef.current.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  });
};




  const callDoc = doc(db, "chat-rooms", roomId, "calls", "active");
  const iceCandidates = collection(callDoc, "iceCandidates");

  const initPeer = async () => {
    pcRef.current = new RTCPeerConnection(ICE_SERVERS);

    localStreamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current!.addTrack(track, localStreamRef.current!);
    });

    pcRef.current.ontrack = (event) => {
  const remoteStream = event.streams[0];

  if (remoteAudioRef.current) {
    remoteAudioRef.current.srcObject = remoteStream;
    remoteAudioRef.current.muted = false;

    // 🔑 THIS LINE FIXES IT
    remoteAudioRef.current
      .play()
      .catch((err) => console.warn("Audio play blocked:", err));
  }
};


    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(iceCandidates, event.candidate.toJSON());
      }
    };
  };

  const startCall = async () => {
    await initPeer();

    const offer = await pcRef.current!.createOffer();
    await pcRef.current!.setLocalDescription(offer);

    await setDoc(callDoc, { offer });
    setCallStatus("ringing");

    

    onSnapshot(callDoc, async (snap) => {
      const data = snap.data();
      if (!pcRef.current?.currentRemoteDescription && data?.answer) {
        await pcRef.current!.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setCallStatus("connected");

        pendingIceCandidates.current.forEach((c) => {
  pcRef.current?.addIceCandidate(new RTCIceCandidate(c));
});
pendingIceCandidates.current = [];

      }
    });

    onSnapshot(iceCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = change.doc.data();

if (pcRef.current?.remoteDescription) {
  pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
} else {
  pendingIceCandidates.current.push(candidate);
}

        }
      });
    });
  };

  const answerCall = async () => {
    await initPeer();

    onSnapshot(callDoc, async (snap) => {
      const data = snap.data();
      if (data?.offer && !pcRef.current?.currentRemoteDescription) {
        await pcRef.current!.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        setCallStatus("connected");

        pendingIceCandidates.current.forEach((c) => {
  pcRef.current?.addIceCandidate(new RTCIceCandidate(c));
});
pendingIceCandidates.current = [];


        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);

        await setDoc(callDoc, { ...data, answer });
        setCallStatus("connected");

        
      }
    });

    onSnapshot(iceCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = change.doc.data();

if (pcRef.current?.remoteDescription) {
  pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
} else {
  pendingIceCandidates.current.push(candidate);
}

        }
      });
    });
  };

  const endCall = async () => {
    pcRef.current?.close();
    pcRef.current = null;

    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    await deleteDoc(callDoc);
    setCallStatus("idle");
    setIsMuted(false);

    
  };
  
  useEffect(() => {
  const handleUnload = async () => {
    try {
      await endCall();
    } catch {
      // ignore errors on unload
    }
  };

  window.addEventListener("beforeunload", handleUnload);

  return () => {
    window.removeEventListener("beforeunload", handleUnload);
  };
}, []);


  return {
  startCall,
  answerCall,
  endCall,
  callStatus,
  isMuted,
  toggleMute,
  remoteAudioRef,
};

};
