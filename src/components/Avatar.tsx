interface AvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export function avatarUrl(seed: string): string {
  const s = encodeURIComponent(seed || 'anonymous');
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${s}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

export function Avatar({ seed, size = 40, className = '' }: AvatarProps) {
  return (
    <img
      src={avatarUrl(seed)}
      width={size}
      height={size}
      alt=""
      className={`rounded-full bg-white border border-navy/10 ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
