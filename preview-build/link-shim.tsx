import type { AnchorHTMLAttributes } from "react";
import { toToken } from "./routes";

export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={`#${toToken(href)}`} {...rest} />;
}
