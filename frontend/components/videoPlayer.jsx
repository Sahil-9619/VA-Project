"use client";

import { useState, useRef } from "react";
import { PlayCircle } from "lucide-react";

/**
 * VideoPlayer
 * @param {string} url - video URL (YouTube or direct)
 * @param {string} title - video title
 * @param {boolean} trackProgress - track lesson completion
 * @param {function} onComplete - callback when video completes
 */
export const VideoPlayer = ({
  url,
  title,
  trackProgress = false,
  onComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // --- Detect YouTube ---
  const getYouTubeEmbedUrl = (url) => {
    try {
      let videoId;
      if (url.includes("youtu.be/"))
        videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("youtube.com/watch?v="))
        videoId = url.split("v=")[1].split("&")[0];

      if (videoId) {
        return {
          type: "youtube",
          embedUrl: `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&autoplay=1`,
          videoId,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  const videoInfo = getYouTubeEmbedUrl(url);
  const isYouTube = !!videoInfo;
  const embedUrl = videoInfo?.embedUrl;
  const videoId = videoInfo?.videoId;
  const isDirectVideo =
    !isYouTube && /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

  // --- Event handler ---
  const handleEnded = () => {
    console.log("hjiiii-====> end");
    if (trackProgress && onComplete) onComplete();
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg aspect-video bg-muted group">
      {!isPlaying ? (
        <div
          className="relative w-full h-full cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity group-hover:opacity-100 opacity-0 z-10">
            <PlayCircle className="h-16 w-16 text-white" />
          </div>

          {isYouTube ? (
            <img
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={url}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          )}
        </div>
      ) : (
        <div className="relative w-full h-full pt-[56.25%]">
          {isYouTube ? (
            <iframe
              src={embedUrl}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title || "Video Player"}
            />
          ) : isDirectVideo ? (
            <video
              ref={videoRef}
              controls
              autoPlay
              controlsList="nodownload"
              onEnded={handleEnded}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              src={url}
            />
          ) : (
            <div className="absolute inset-0 bg-black text-white flex items-center justify-center">
              Unsupported video URL
            </div>
          )}
        </div>
      )}
    </div>
  );
};
