import React, { useState } from "react";
import { LiveKitRoom, useLocalParticipant, useRemoteParticipants, AudioTrack, TrackReference } from "@livekit/components-react";
import { Mic } from "lucide-react"; // Or use any mic SVG/icon

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
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#222" }}>
      <div style={{ background: "#333", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 24px #0006", width: "320px" }}>
        <div style={{ background: "#111", color: "#0ff", fontSize: "2.5rem", textAlign: "center", borderRadius: "8px", marginBottom: "24px", padding: "16px" }}>
          {screen}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
          {[1,2,3,4,5,6,7,8,9,".",0,"R"].map((val) => (
            <button key={val} style={{
              fontSize: "1.5rem", padding: "16px", borderRadius: "8px", background: "#444", color: "#fff", border: "none", cursor: "pointer"
            }} onClick={() => handleButton(val.toString())}>{val}</button>
          ))}
        </div>
        {!connected ? (
          <button
            style={{
              width: "100%", padding: "16px", fontSize: "1.25rem", borderRadius: "8px", background: "#0ff", color: "#222", border: "none", fontWeight: "bold", cursor: "pointer"
            }}
            onClick={handleConnect}
            disabled={loading || !screen}
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
        ) : (
          <button
            style={{
              width: "100%", padding: "16px", fontSize: "1.25rem", borderRadius: "8px", background: "#f44", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer"
            }}
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        )}
        {error && <div style={{ color: "#f44", marginTop: "16px" }}>{error}</div>}
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
            {/* Render remote participants' audio */}
            <RemoteAudio />
          </LiveKitRoom>
        )}
      </div>
    </main>
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "24px" }}>
      <button
        style={{ background: "none", border: "none", cursor: "pointer" }}
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
      <div style={{ color: ptt ? "#f44" : "#888", marginTop: "8px" }}>
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
