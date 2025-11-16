
import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, Subtitles } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface VideoTrack {
  src: string;
  kind: "subtitles" | "captions" | "descriptions";
  srclang: string;
  label: string;
  default?: boolean;
}

interface AccessibleVideoProps {
  src: string;
  poster?: string;
  tracks?: VideoTrack[];
  transcript?: string;
  audioDescription?: string;
  className?: string;
  title: string;
}

export function AccessibleVideo({
  src,
  poster,
  tracks = [],
  transcript,
  audioDescription,
  className,
  title,
}: AccessibleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleCaptions = () => {
    if (videoRef.current) {
      const textTracks = videoRef.current.textTracks;
      for (let i = 0; i < textTracks.length; i++) {
        if (textTracks[i].kind === "captions" || textTracks[i].kind === "subtitles") {
          textTracks[i].mode = showCaptions ? "hidden" : "showing";
        }
      }
      setShowCaptions(!showCaptions);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative group">
        <video
          ref={videoRef}
          poster={poster}
          className="w-full rounded-lg"
          aria-label={title}
          crossOrigin="anonymous"
        >
          <source src={src} type="video/mp4" />
          {tracks.map((track, index) => (
            <track
              key={index}
              src={track.src}
              kind={track.kind}
              srcLang={track.srclang}
              label={track.label}
              default={track.default}
            />
          ))}
          Your browser does not support the video tag.
        </video>

        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute video" : "Mute video"}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCaptions}
              aria-label={showCaptions ? "Hide captions" : "Show captions"}
              className="text-white hover:bg-white/20"
            >
              <Subtitles className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transcript Toggle */}
      {transcript && (
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={() => setShowTranscript(!showTranscript)}
            aria-expanded={showTranscript}
            aria-controls="video-transcript"
          >
            {showTranscript ? "Hide" : "Show"} Transcript
          </Button>
          {showTranscript && (
            <div
              id="video-transcript"
              className="p-4 bg-muted rounded-lg text-sm max-h-64 overflow-y-auto"
              role="region"
              aria-label="Video transcript"
            >
              {transcript}
            </div>
          )}
        </div>
      )}

      {/* Audio Description */}
      {audioDescription && (
        <details className="p-4 bg-muted rounded-lg">
          <summary className="cursor-pointer font-medium">Audio Description</summary>
          <p className="mt-2 text-sm text-muted-foreground">{audioDescription}</p>
        </details>
      )}
    </div>
  );
}
