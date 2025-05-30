export const dynamic = "force-dynamic"; // ensures server-side auth/session checks always run

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-white dark:bg-gray-800">{children}</main>;
}
