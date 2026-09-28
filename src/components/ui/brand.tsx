import Image from "next/image";
import sol from "../../../public/brand/sol.png";
import letra from "../../../public/brand/kaizen-letra.png";
import logo from "../../../public/brand/kaizen-logo.png";

/** Sol de petalos. `spin` lo hace girar lentamente. */
export function Sun({ size = 40, spin = false, className = "", priority = false }: {
  size?: number;
  spin?: boolean;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={sol}
      alt=""
      aria-hidden
      width={size}
      height={size}
      priority={priority}
      className={`${spin ? "animate-spin-slow" : ""} ${className}`}
    />
  );
}

/** Palabra KAIZEN. */
export function Wordmark({ height = 28, className = "", priority = false }: {
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={letra}
      alt="KAIZEN"
      height={height}
      style={{ width: "auto", height }}
      priority={priority}
      className={className}
    />
  );
}

/** Logo completo (sol + KAIZEN), para login y pantallas grandes. */
export function FullLogo({ width = 280, className = "", priority = false }: {
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="KAIZEN"
      width={width}
      style={{ width, height: "auto" }}
      priority={priority}
      className={className}
    />
  );
}
