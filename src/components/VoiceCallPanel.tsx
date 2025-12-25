import { useEffect, useState } from "react";
import { useVoiceCall } from "../hooks/useVoiceCall";


type Props = {
  roomId: string;
  userId: string;
};

export default function VoiceCallPanel({ roomId, userId }: Props) {
    const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
const [outputDevices, setOutputDevices] = useState<MediaDeviceInfo[]>([]);
const [selectedOutput, setSelectedOutput] = useState("");
useEffect(() => {
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    setInputDevices(devices.filter((d: MediaDeviceInfo) => d.kind === "audioinput"));
    setOutputDevices(devices.filter((d: MediaDeviceInfo) => d.kind === "audiooutput"));
  });
}, []);

  const {
  startCall,
  answerCall,
  endCall,
  callStatus,
  isMuted,
  toggleMute,
  remoteAudioRef,
} = useVoiceCall(roomId, userId);
const handleOutputChange = async (deviceId: string) => {
  if (!remoteAudioRef.current) return;

  // Chrome-only API
  // @ts-ignore
  if (remoteAudioRef.current.setSinkId) {
    await remoteAudioRef.current.setSinkId(deviceId);
    setSelectedOutput(deviceId);
  }
};


 return (
  <div style={{ marginBottom: 10 }}>
    <div>
      <b>Call Status:</b> {callStatus}
    </div>

    {callStatus === "idle" && (
      <>
        <button onClick={startCall}>📞 Start Call</button>
        <button onClick={answerCall}>📲 Answer Call</button>
      </>
    )}

    {callStatus === "connected" && (
      <>
        <button onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🎙️ Mute"}
        </button>
        <button onClick={endCall}>❌ End Call</button>
      </>
    )}

    <div style={{ marginTop: 8 }}>
      <label>Microphone:</label>
      <select>
        {inputDevices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || "Microphone"}
          </option>
        ))}
      </select>
    </div>

    <div style={{ marginTop: 8 }}>
      <label>Speaker:</label>
      <select
        value={selectedOutput}
        onChange={(e) => handleOutputChange(e.target.value)}
      >
        {outputDevices.map((d) => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label || "Speaker"}
          </option>
        ))}
      </select>
    </div>

    <audio ref={remoteAudioRef} />
  </div>
);

}
