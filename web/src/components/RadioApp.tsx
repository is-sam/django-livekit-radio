import React, { useState } from "react";
import { LiveKitRoom, useLocalParticipant, useRemoteParticipants, AudioTrack, TrackReference } from "@livekit/components-react";
import { Mic } from "lucide-react";
import radioStyles from "./radio.module.css";

export default function RadioApp() {
  const [frequency, setFrequency] = useState("");
  const [screen, setScreen] = useState("88.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [ptt, setPtt] = useState(false);

  const handleButton = (val: string) => {
    if (frequency.length >= 5 && val !== "R" && val !== ".") return;
    if (val === "R") {
      setFrequency("");
      setScreen("88.0");
    } else if (val === ".") {
      if (!frequency.includes(".")) {
        setFrequency(frequency + val);
        setScreen(frequency + val);
      }
    } else {
      setFrequency(frequency + val);
      setScreen(frequency + val);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/radio/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ frequency: parseFloat(screen) }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setConnected(true);
      } else {
        setError(data.error || "Failed to get token");
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setToken("");
    setPtt(false);
  };

  // LiveKit room logic
  return (
    <div className={radioStyles.radioContainer}>
      <div className={radioStyles.radioCard}>
        <div className={radioStyles.radioScreen}>{screen}</div>
        <div className={radioStyles.radioPad}>
          {[1,2,3,4,5,6,7,8,9,".",0,"R"].map((val) => (
            <button key={val} className={radioStyles.radioBtn} onClick={() => handleButton(val.toString())}>{val}</button>
          ))}
        </div>
        {!connected ? (
          <button className={radioStyles.connectBtn} onClick={handleConnect} disabled={loading || !screen}>
            {loading ? "Connecting..." : "Connect"}
          </button>
        ) : (
          <button className={radioStyles.disconnectBtn} onClick={handleDisconnect}>
            Disconnect
          </button>
        )}
        {error && <div className={radioStyles.error}>{error}</div>}
        {connected && token && (
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={handleDisconnect}
          >
            <PTTMic ptt={ptt} setPtt={setPtt} />
            <RemoteAudio />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

// Push-to-talk mic component
function PTTMic({ ptt, setPtt }: { ptt: boolean, setPtt: (v: boolean) => void }) {
  const { localParticipant } = useLocalParticipant();

  React.useEffect(() => {
    // Always start muted
    const audioPub = localParticipant && localParticipant.audioTrackPublications.size > 0
      ? Array.from(localParticipant.audioTrackPublications.values())[0]
      : undefined;
    if (audioPub) {
      audioPub.mute();
    }
  }, [localParticipant]);

  const setMicEnabled = (enabled: boolean) => {
    const audioPub = localParticipant && localParticipant.audioTrackPublications.size > 0
      ? Array.from(localParticipant.audioTrackPublications.values())[0]
      : undefined;
    if (audioPub) {
      if (enabled) {
        audioPub.unmute();
      } else {
        audioPub.mute();
      }
    }
  };

  return (
    <div className={radioStyles.micContainer}>
      <button
        className={radioStyles.micButton}
        onMouseDown={() => { setPtt(true); setMicEnabled(true); }}
        onMouseUp={() => { setPtt(false); setMicEnabled(false); }}
        onMouseLeave={() => { setPtt(false); setMicEnabled(false); }}
        onTouchStart={() => { setPtt(true); setMicEnabled(true); }}
        onTouchEnd={() => { setPtt(false); setMicEnabled(false); }}
        onKeyDown={e => {
          if (e.key === " " || e.key === "Enter") {
            setPtt(true); setMicEnabled(true);
          }
        }}
        onKeyUp={e => {
          if (e.key === " " || e.key === "Enter") {
            setPtt(false); setMicEnabled(false);
          }
        }}
        tabIndex={0}
      >
        <Mic size={48} color={ptt ? "#f44" : "#888"} />
      </button>
      <div className={radioStyles.micStatus}>
        {ptt ? "Transmitting" : "Mic Off"}
      </div>
    </div>
  );
}

// Add this component below PTTMic
function RemoteAudio() {
  const remoteParticipants = useRemoteParticipants();
  return (
    <>
      {remoteParticipants.map((participant) => {
        const audioPub = participant.audioTrackPublications.size > 0
          ? Array.from(participant.audioTrackPublications.values())[0]
          : undefined;
        if (!audioPub) return null;
        const trackRef = {
          participant,
          publication: audioPub,
          source: "microphone" as any,
        };
        return (
          <AudioTrack key={audioPub.trackSid} trackRef={trackRef} volume={1} />
        );
      })}
    </>
  );
}
