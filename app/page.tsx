"use client";

import Link from "next/link";
import { ChatbotUISVG } from "@/components/icons/chatbotui-svg";
import { IconArrowRight } from "@tabler/icons-react";
import { useTheme } from "next-themes";

export default function HomePage() {
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <ChatbotUISVG theme={theme === "dark" ? "dark" : "light"} scale={0.3} />
      <h1 className="mt-4 text-4xl font-bold text-gray-800 dark:text-gray-200">
        Chatbot UI
      </h1>
      <Link
        href="/chat"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        Start Chatting <IconArrowRight size={20} />
      </Link>
    </div>
  );
}
