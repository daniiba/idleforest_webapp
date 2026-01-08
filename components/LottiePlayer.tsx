import { Player } from "@lottiefiles/react-lottie-player";
import type { ForwardedRef } from "react";

interface LottiePlayerProps {
  playerRef: ForwardedRef<Player>;
  src: any;
  style?: React.CSSProperties;
  background?: string;
  speed?: number;
  keepLastFrame?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  onEvent?: (event: string) => void;
}

export default function LottiePlayer({ 
  playerRef, 
  src, 
  style, 
  background = "transparent",
  speed = 1,
  keepLastFrame = false,
  autoplay = false,
  loop = false,
  onEvent 
}: LottiePlayerProps) {
  return (
    <Player
      ref={playerRef}
      src={src}
      style={style}
      background={background}
      speed={speed}
      keepLastFrame={keepLastFrame}
      autoplay={autoplay}
      loop={loop}
      onEvent={onEvent}
    />
  );
}
