"use client";

import React, { useMemo, useState } from "react";
import SevenSegmentDisplay from "./SevenSegmentDisplay";
import { LiveKitRoom, useLocalParticipant, useRemoteParticipants, AudioTrack } from "@livekit/components-react";
import { Mic } from "lucide-react";
import type { LocalParticipant } from "livekit-client";
import { Track } from "livekit-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, getAuthHeaders } from "@/lib/utils";

const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "R"];

export default function RadioApp() {
  const [screen, setScreen] = useState("88.0");
  const [button, setButton] = useState<string | null>(null);
  const [buttonEvent, setButtonEvent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [ptt, setPtt] = useState(false);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);

  const keypad = useMemo(() => keypadKeys, []);

  // Move all button logic to display
  // Only send button to display
  const handleButton = (value: string) => {
    setButton(value);
    setButtonEvent((e) => e + 1);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/radio/token`, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ frequency: parseFloat(screen) }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setToken(data.token);
        setConnected(true);
      } else {
        setError(data.error || "Failed to get token");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    }
    setLoading(false);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setToken("");
    setPtt(false);
    setLocalParticipant(null);
  };

  return (
    <section className="flex w-full justify-center px-4">
      <div className="w-full max-w-lg space-y-5">
        <Card className="w-full border border-white/10 bg-slate-950/80 text-white shadow-2xl backdrop-blur-lg">
          <CardHeader className="space-y-4 text-center">
            <Badge className="mx-auto w-fit border border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
              Frequency
            </Badge>
            <SevenSegmentDisplay connected={connected} value={screen} button={button} buttonEvent={buttonEvent} onChange={setScreen} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {keypad.map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant={key === "R" ? "destructive" : "secondary"}
                  onClick={() => handleButton(key)}
                  disabled={loading || connected}
                  className={cn(
                    "h-12 rounded-xl text-base font-semibold tracking-wide shadow-sm transition-transform",
                    !loading && !connected && "hover:-translate-y-0.5",
                  )}
                >
                  {key === "R" ? "Reset" : key}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              <Button
                onClick={connected ? handleDisconnect : handleConnect}
                disabled={loading}
                className={cn(
                  "w-full rounded-xl text-base font-semibold transition-colors",
                  connected
                    ? "bg-rose-500 text-white hover:bg-rose-400"
                    : "bg-cyan-500 text-slate-950 hover:bg-cyan-400",
                )}
              >
                {connected ? "Disconnect" : loading ? "Connecting…" : "Connect"}
              </Button>
              {error && (
                <Alert variant="destructive" className="border-destructive bg-destructive/10 text-destructive-foreground">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-5 shadow-inner">
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-widest text-slate-200/80">
                <Mic className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                Push To Talk
              </div>
              <PTTMic
                ptt={ptt}
                setPtt={setPtt}
                disabled={!connected || !localParticipant}
                localParticipant={localParticipant}
              />
            </div>
          </CardContent>
        </Card>

        {connected && token && (
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect
            audio
            video={false}
            onDisconnected={handleDisconnect}
          >
            <LocalParticipantBridge onUpdate={setLocalParticipant} />
            <RemoteAudio />
          </LiveKitRoom>
        )}
      </div>
    </section>
  );
}

function PTTMic({
  ptt,
  setPtt,
  disabled,
  localParticipant,
}: {
  ptt: boolean;
  setPtt: (value: boolean) => void;
  disabled: boolean;
  localParticipant: LocalParticipant | null;
}) {
  React.useEffect(() => {
    if (!localParticipant) return;
    const audioPublication =
      localParticipant.audioTrackPublications.size > 0
        ? Array.from(localParticipant.audioTrackPublications.values())[0]
        : undefined;
    if (audioPublication) {
      audioPublication.mute();
    }
  }, [localParticipant]);

  const setMicEnabled = (enabled: boolean) => {
    if (!localParticipant) return;
    const audioPublication =
      localParticipant.audioTrackPublications.size > 0
        ? Array.from(localParticipant.audioTrackPublications.values())[0]
        : undefined;
    if (audioPublication) {
      if (enabled) {
        audioPublication.unmute();
      } else {
        audioPublication.mute();
      }
    }
  };

  const toggle = (state: boolean) => {
    if (disabled || !localParticipant) return;
    setPtt(state);
    setMicEnabled(state);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onMouseDown={() => toggle(true)}
        onMouseUp={() => toggle(false)}
        onMouseLeave={() => toggle(false)}
        onTouchStart={() => toggle(true)}
        onTouchEnd={() => toggle(false)}
        onKeyDown={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            toggle(true);
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            toggle(false);
          }
        }}
        className="h-28 w-28 rounded-full border-cyan-500/40 bg-slate-950/60 text-cyan-300 hover:bg-cyan-500/10 focus-visible:ring-cyan-400 disabled:cursor-not-allowed"
      >
        <Mic className={ptt ? "h-10 w-10 text-red-400" : "h-10 w-10"} aria-hidden="true" />
        <span className="sr-only">Push to talk</span>
      </Button>
      <span className="text-sm font-medium">
        {disabled ? "Connect to enable the microphone" : ptt ? "Transmitting…" : "Mic muted"}
      </span>
    </div>
  );
}

function LocalParticipantBridge({
  onUpdate,
}: {
  onUpdate: (participant: LocalParticipant | null) => void;
}) {
  const { localParticipant } = useLocalParticipant();

  React.useEffect(() => {
    onUpdate(localParticipant ?? null);
    return () => onUpdate(null);
  }, [localParticipant, onUpdate]);

  return null;
}

function RemoteAudio() {
  const remoteParticipants = useRemoteParticipants();

  return (
    <>
      {remoteParticipants.map((participant) => {
        const audioPublication =
          participant.audioTrackPublications.size > 0
            ? Array.from(participant.audioTrackPublications.values())[0]
            : undefined;
        if (!audioPublication) return null;
        const trackRef = {
          participant,
          publication: audioPublication,
          source: Track.Source.Microphone,
        };
        return <AudioTrack key={audioPublication.trackSid} trackRef={trackRef} volume={1} />;
      })}
    </>
  );
}
