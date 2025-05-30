import { ReactNode } from "react";

// Force this folder to always render dynamically (no static prerender)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Duub.ai Chat",
};

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
