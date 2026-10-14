import Image from "next/image";

export default function BrandLogo({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/favicon.ico"
      alt=""
      width={size}
      height={size}
      className={`rounded-lg object-cover brightness-0 invert ${className}`}
      priority
    />
  );
}
