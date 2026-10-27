import { useAppStore } from '@/store/useAppStore';

export type AvatarPose = 'waving' | 'standing' | 'laptop' | 'neutral';

export interface AvatarProps {
  pose?: AvatarPose;
  glbUrl?: string;
  className?: string;
}

const POSE_SOURCES: Record<
  AvatarPose,
  { src: string; alt: string; isFullBody: boolean }
> = {
  waving: {
    src: '/assets/avatar/avatar_waving.webp',
    alt: 'Sujay Paul P — Waving Avatar',
    isFullBody: false,
  },
  standing: {
    src: '/assets/avatar/avatar_standing_wave.webp',
    alt: 'Sujay Paul P — Full Body Standing Avatar',
    isFullBody: true,
  },
  laptop: {
    src: '/assets/avatar/avatar_laptop.webp',
    alt: 'Sujay Paul P — Coding on Laptop Avatar',
    isFullBody: false,
  },
  neutral: {
    src: '/assets/avatar/avatar_neutral.webp',
    alt: 'Sujay Paul P — Avatar',
    isFullBody: true,
  },
};

/**
 * Clean 2D Native-Resolution <Avatar /> Component:
 * - Renders the color-matched transparent PNG poses at full native Retina sharpness.
 * - Anchored flush at the bottom of the Hero box (transformOrigin: bottom center) so it never floats up with a gap.
 * - Smoothly tracks the shared cursor rig (`dampedPointer`) with subtle perspective tilt and shadow.
 */
export function Avatar({ pose = 'waving', className = '' }: AvatarProps) {
  const dampedPointer = useAppStore((s) => s.dampedPointer);
  const prefersReducedMotion = useAppStore((s) => s.prefersReducedMotion);
  const current = POSE_SOURCES[pose];

  const tiltY = prefersReducedMotion ? 0 : dampedPointer.x * 8;
  const tiltX = prefersReducedMotion ? 0 : -dampedPointer.y * 5;
  const shiftX = prefersReducedMotion ? 0 : dampedPointer.x * 8;
  const shadowX = prefersReducedMotion ? 0 : -dampedPointer.x * 15;
  const shadowY = prefersReducedMotion ? 6 : 6 + dampedPointer.y * 8;

  return (
    <div
      className={`relative w-full h-full flex items-end justify-center overflow-hidden select-none ${className}`}
    >
      <div
        className="w-full h-full flex items-end justify-center avatar-breathe origin-bottom"
        style={{
          transform: `perspective(900px) translate3d(${shiftX.toFixed(1)}px, 0px, 0px) rotateY(${tiltY.toFixed(2)}deg) rotateX(${tiltX.toFixed(2)}deg)`,
          filter: `drop-shadow(${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 14px rgba(0, 0, 0, 0.16))`,
          transition: 'filter 120ms ease-out',
        }}
      >
        <img
          key={pose}
          src={current.src}
          alt={current.alt}
          draggable={false}
          className={`${
            current.isFullBody ? 'h-[94%]' : 'h-[96%]'
          } w-auto max-w-full object-contain object-bottom transition-opacity duration-300`}
        />
      </div>
    </div>
  );
}
