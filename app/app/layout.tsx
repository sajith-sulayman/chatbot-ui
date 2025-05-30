export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Chatbot UI</title>
        <meta name="description" content="Simple Chatbot UI" />
      </head>
      <body>{children}</body>
    </html>
  );
}
