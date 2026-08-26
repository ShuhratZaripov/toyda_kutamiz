import Image from "next/image";

type BotanicalVariant = "foreground" | "mid" | "embrace";

type BotanicalOrnamentProps = {
  className?: string;
  depth?: number;
  loading?: "eager" | "lazy";
  reveal?: boolean;
  variant?: BotanicalVariant;
};

const sources: Record<BotanicalVariant, string> = {
  foreground: "/botanicals/botanical-foreground.webp",
  mid: "/botanicals/botanical-mid.webp",
  embrace: "/botanicals/botanical-embrace.webp",
};

export function BotanicalOrnament({
  className,
  depth,
  loading = "lazy",
  reveal = false,
  variant = "mid",
}: BotanicalOrnamentProps) {
  return (
    <Image
      className={className}
      src={sources[variant]}
      width="1024"
      height="1536"
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable="false"
      loading={loading}
      unoptimized
      data-depth={depth}
      data-reveal={reveal || undefined}
    />
  );
}
