import { ReactNode } from "react";

export const metadata = {
  title: "Duub.ai Chat",
};

export default function ChatLayout({ children }: { children: ReactNode }) {
  // you can wrap children in your main <Dashboard> or other providers if needed
  return <>{children}</>;
}
