"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import styles from "./values.module.css";

type ArtVariant = "rocket" | "fists" | "profile" | "peace" | "whale" | "collageTree";
type SlideDirection = "left" | "right" | "top" | "bottom";

const artAssets: Record<ArtVariant, { src: string; width: number; height: number; className: string }> = {
  rocket: {
    src: "/values/rocket-child.png",
    width: 953,
    height: 758,
    className: styles.artRocket,
  },
  fists: {
    src: "/values/raised-fists.png",
    width: 816,
    height: 1168,
    className: styles.artFists,
  },
  profile: {
    src: "/values/feminist-profile.png",
    width: 470,
    height: 830,
    className: styles.artProfile,
  },
  peace: {
    src: "/values/peace-earth.png",
    width: 1185,
    height: 1133,
    className: styles.artPeace,
  },
  whale: {
    src: "/values/whale-earth.png",
    width: 800,
    height: 846,
    className: styles.artWhale,
  },
  collageTree: {
    src: "/values/hero-collage-tree.png",
    width: 633,
    height: 729,
    className: styles.artCollageTree,
  },
};

const slideClasses: Record<SlideDirection, string> = {
  left: styles.slideFromLeft,
  right: styles.slideFromRight,
  top: styles.slideFromTop,
  bottom: styles.slideFromBottom,
};

type ValuesSectionArtProps = {
  variant: ArtVariant;
  className?: string;
  direction?: SlideDirection;
  priority?: boolean;
};

export default function ValuesSectionArt({
  variant,
  className,
  direction = "right",
  priority = false,
}: ValuesSectionArtProps) {
  const artRef = useRef<HTMLSpanElement>(null);
  const asset = artAssets[variant];

  useEffect(() => {
    const element = artRef.current;
    if (!element) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) {
      element.dataset.flyState = "in";
      return;
    }

    if (!("IntersectionObserver" in window)) {
      element.dataset.flyState = "in";
      return;
    }

    const reveal = () => {
      element.dataset.flyState = "in";
    };
    const observerTarget = element.parentElement ?? element;

    const hasReachedViewport = () => {
      const rect = observerTarget.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.92;
    };

    if (hasReachedViewport()) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry || (!entry.isIntersecting && entry.boundingClientRect.top >= window.innerHeight * 0.92)) {
          return;
        }

        reveal();
        observer.disconnect();
      },
      {
        rootMargin: "0px 30% -14% 30%",
        threshold: 0.01,
      },
    );

    observer.observe(observerTarget);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <span
      className={[styles.sectionArt, asset.className, slideClasses[direction], className].filter(Boolean).join(" ")}
      data-fly-state="out"
      data-art-variant={variant}
      ref={artRef}
      aria-hidden="true"
    >
      <Image
        className={styles.sectionArtImage}
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt=""
        priority={priority}
        quality={92}
        sizes="(max-width: 767px) 42vw, 24vw"
      />
    </span>
  );
}
