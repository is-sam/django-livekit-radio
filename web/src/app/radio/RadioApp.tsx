"use client";

import React, { useMemo, useState } from "react";
import { LiveKitRoom, useLocalParticipant, useRemoteParticipants, AudioTrack } from "@livekit/components-react";
import { Mic, Volume2 } from "lucide-react";
import type { LocalParticipant } from "livekit-client";
import { Track } from "livekit-client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const keypadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "R"];

export default function RadioApp() {
  const [screen, setScreen] = useState("88.0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [ptt, setPtt] = useState(false);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);

  const keypad = useMemo(() => keypadKeys, []);

  const handleButton = (value: string) => {
    if (value === "R") {
      setScreen("88.0");
      return;
    }

    if (value === ".") {
      if (!screen.includes(".")) {
        const next = `${screen}${value}`;
        setScreen(next);
      }
      return;
    }

    if (screen.length >= 6 || connected) return;

    const next = screen === "88.0" ? value : `${screen}${value}`;
    setScreen(next);
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
    <section className="flex w-full justify-center">
      <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card className="w-full border-white/10 bg-slate-900/70 text-white shadow-2xl backdrop-blur">
          <CardHeader className="space-y-4">
            <Badge className="w-fit bg-cyan-500/10 text-cyan-300">Frequency</Badge>
            <CardTitle className="text-4xl font-semibold tracking-[0.4rem] text-cyan-200">
              {screen}
            </CardTitle>
            <CardDescription className="text-sm text-slate-200/70">
              Dial into a channel and establish your LiveKit connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-3">
              {keypad.map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant={key === "R" ? "destructive" : "secondary"}
                  onClick={() => handleButton(key)}
                  disabled={loading || connected}
                  className={cn(
                    "h-14 rounded-xl text-lg font-semibold tracking-wider shadow-sm transition-transform",
                    !loading && !connected && "hover:-translate-y-0.5",
                  )}
                >
                  {key === "R" ? "Reset" : key}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
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
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-white/10 bg-slate-900/70 text-white shadow-2xl backdrop-blur">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <Mic className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                Push-to-talk console
              </CardTitle>
              <CardDescription className="text-slate-200/70">
                Hold the mic to broadcast. Release to return to listening mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PTTMic
                ptt={ptt}
                setPtt={setPtt}
                disabled={!connected || !localParticipant}
                localParticipant={localParticipant}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm text-slate-200/70">
              <Separator className="bg-white/10" />
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                <span>
                  {connected
                    ? "Connected to the selected frequency. Audio will play automatically."
                    : "Connect to a channel to start streaming."
                  }
                </span>
              </div>
            </CardFooter>
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
