import { ReactNode } from "react";

// disable static prerender for this route
export const dynamic = "force-dynamic";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
