import Image from "next/image";

type BotanicalVariant = "foreground" | "mid";

type BotanicalOrnamentProps = {
  className?: string;
  depth?: number;
  loading?: "eager" | "lazy";
  reveal?: boolean;
  variant?: BotanicalVariant;
};

const sources: Record<BotanicalVariant, string> = {
  foreground: "/botanicals/botanical-foreground.3b2f1d61.webp",
  mid: "/botanicals/botanical-mid.5a66fa18.webp",
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
      width="768"
      height="1152"
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
