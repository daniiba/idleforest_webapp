"use client";

import { useEffect, useRef } from "react";

export interface AnimationSequence {
    startFrame: number;
    endFrame: number;
    loop?: boolean;
    fps?: number;
}

interface SpriteAnimationProps {
    src: string;
    frameWidth: number;
    frameHeight: number;
    cols: number;
    animations?: Record<string, AnimationSequence>;
    currentAnimation?: string;
    fps?: number;
    scale?: number;
    onAnimationComplete?: (animName: string) => void;
    triggerId?: number | string;
    className?: string;
}

export default function SpriteAnimation({
    src,
    frameWidth,
    frameHeight,
    cols,
    animations,
    currentAnimation = "default",
    fps = 10,
    scale = 1,
    onAnimationComplete,
    triggerId,
    className
}: SpriteAnimationProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameIndexRef = useRef(0);
    const lastTimeRef = useRef(0);
    const animationFrameIdRef = useRef<number>();
    const currentAnimNameRef = useRef(currentAnimation);
    const prevTriggerIdRef = useRef(triggerId);
    const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

    // Reset frame index when animation changes OR triggerId changes
    useEffect(() => {
        if (currentAnimNameRef.current !== currentAnimation || prevTriggerIdRef.current !== triggerId) {
            // If we have an animation definition, jump to its start
            if (animations && animations[currentAnimation]) {
                frameIndexRef.current = animations[currentAnimation].startFrame;
            } else {
                frameIndexRef.current = 0;
            }
            currentAnimNameRef.current = currentAnimation;
            prevTriggerIdRef.current = triggerId;
        }
    }, [currentAnimation, animations, triggerId]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        let img: HTMLImageElement;

        // Check cache
        if (imageCacheRef.current.has(src)) {
            img = imageCacheRef.current.get(src)!;
        } else {
            img = new Image();
            img.src = src;
            imageCacheRef.current.set(src, img);
        }

        const animate = (time: number) => {
            if (!canvasRef.current) return; // Unmount check

            // Determine current animation params
            let start = 0;
            let end = 0;
            let loop = true;
            let currentFps = fps;

            if (animations && currentAnimation && animations[currentAnimation]) {
                const anim = animations[currentAnimation];
                start = anim.startFrame;
                end = anim.endFrame;
                loop = anim.loop ?? true;
                currentFps = anim.fps ?? fps;
            } else {
                end = 9999;
            }

            const interval = 1000 / currentFps;

            if (time - lastTimeRef.current >= interval) {
                lastTimeRef.current = time;

                // Clear
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Draw
                const currentFrame = frameIndexRef.current;
                const col = currentFrame % cols;
                const row = Math.floor(currentFrame / cols);

                const sx = col * frameWidth;
                const sy = row * frameHeight;

                // Only draw if image is loaded
                if (img.complete && img.naturalWidth !== 0) {
                    ctx.drawImage(
                        img,
                        sx, sy, frameWidth, frameHeight,
                        0, 0, frameWidth * scale, frameHeight * scale
                    );
                }

                // Advance
                if (currentFrame < end) {
                    frameIndexRef.current++;
                } else {
                    if (loop) {
                        frameIndexRef.current = start;
                    } else {
                        // Animation ended
                        if (onAnimationComplete) {
                            onAnimationComplete(currentAnimation);
                        }
                        // Usually stay on last frame.
                        frameIndexRef.current = end;
                    }
                }
            }

            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        const initCanvas = () => {
            // Only reset dimensions if they changed (resets context)
            const targetW = frameWidth * scale;
            const targetH = frameHeight * scale;

            if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
                ctx.imageSmoothingEnabled = false;
            }

            animationFrameIdRef.current = requestAnimationFrame(animate);
        };

        if (img.complete) {
            initCanvas();
        } else {
            img.onload = () => {
                initCanvas();
            };
        }

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, [src, frameWidth, frameHeight, cols, fps, scale, animations, currentAnimation, onAnimationComplete]);

    return (
        <canvas
            ref={canvasRef}
            className={`pixelated ${className || ''}`}
            style={{
                width: frameWidth * scale,
                height: frameHeight * scale,
                imageRendering: 'pixelated'
            }}
        />
    );
}
