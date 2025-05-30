"use client";

import { Dashboard } from "@/components/ui/dashboard";
import { ChatbotUIContext } from "@/context/context";
import { getAssistantWorkspacesByWorkspaceId } from "@/db/assistants";
import { getChatsByWorkspaceId } from "@/db/chats";
import { getCollectionWorkspacesByWorkspaceId } from "@/db/collections";
import { getFileWorkspacesByWorkspaceId } from "@/db/files";
import { getFoldersByWorkspaceId } from "@/db/folders";
import { getModelWorkspacesByWorkspaceId } from "@/db/models";
import { getPresetWorkspacesByWorkspaceId } from "@/db/presets";
import { getPromptWorkspacesByWorkspaceId } from "@/db/prompts";
import { getAssistantImageFromStorage } from "@/db/storage/assistant-images";
import { getToolWorkspacesByWorkspaceId } from "@/db/tools";
import { getWorkspaceById } from "@/db/workspaces";
import { convertBlobToBase64 } from "@/lib/blob-to-b64";
import { LLMID } from "@/types";
import { useParams, useSearchParams } from "next/navigation";
import { ReactNode, useContext, useEffect, useState } from "react";
import Loading from "../loading";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = params.workspaceid as string;

  const {
    setChatSettings,
    setAssistants,
    setAssistantImages,
    setChats,
    setCollections,
    setFolders,
    setFiles,
    setPresets,
    setPrompts,
    setTools,
    setModels,
    selectedWorkspace,
    setSelectedWorkspace,
    setSelectedChat,
    setChatMessages,
    setUserInput,
    setIsGenerating,
    setFirstTokenReceived,
    setChatFiles,
    setChatImages,
    setNewMessageFiles,
    setNewMessageImages,
    setShowFilesDisplay,
  } = useContext(ChatbotUIContext);

  const [loading, setLoading] = useState(true);

  // On workspaceId change, reset state & load data
  useEffect(() => {
    (async () => {
      await fetchWorkspaceData(workspaceId);
      // reset chat state
      setUserInput("");
      setChatMessages([]);
      setSelectedChat(null);
      setIsGenerating(false);
      setFirstTokenReceived(false);
      setChatFiles([]);
      setChatImages([]);
      setNewMessageFiles([]);
      setNewMessageImages([]);
      setShowFilesDisplay(false);
    })();
  }, [workspaceId]);

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true);

    const workspace = await getWorkspaceById(workspaceId);
    setSelectedWorkspace(workspace);

    const assistantData = await getAssistantWorkspacesByWorkspaceId(workspaceId);
    setAssistants(assistantData.assistants);

    // load assistant images
    for (const assistant of assistantData.assistants) {
      const url =
        assistant.image_path
          ? (await getAssistantImageFromStorage(assistant.image_path)) || ""
          : "";
      const base64 = url
        ? convertBlobToBase64(await (await fetch(url)).blob())
        : "";
      setAssistantImages((prev) => [
        ...prev,
        { assistantId: assistant.id, path: assistant.image_path, base64, url },
      ]);
    }

    setChats(await getChatsByWorkspaceId(workspaceId));
    setCollections(
      (await getCollectionWorkspacesByWorkspaceId(workspaceId)).collections
    );
    setFolders(await getFoldersByWorkspaceId(workspaceId));
    setFiles((await getFileWorkspacesByWorkspaceId(workspaceId)).files);
    setPresets((await getPresetWorkspacesByWorkspaceId(workspaceId)).presets);
    setPrompts((await getPromptWorkspacesByWorkspaceId(workspaceId)).prompts);
    setTools((await getToolWorkspacesByWorkspaceId(workspaceId)).tools);
    setModels((await getModelWorkspacesByWorkspaceId(workspaceId)).models);

    // chat settings from workspace defaults or URL
    setChatSettings({
      model:
        (searchParams.get("model") ||
          workspace?.default_model ||
          "gpt-4-1106-preview") as LLMID,
      prompt:
        workspace?.default_prompt ||
        "You are a friendly, helpful AI assistant.",
      temperature: workspace?.default_temperature || 0.5,
      contextLength: workspace?.default_context_length || 4096,
      includeProfileContext: workspace?.include_profile_context ?? true,
      includeWorkspaceInstructions:
        workspace?.include_workspace_instructions ?? true,
      embeddingsProvider:
        (workspace?.embeddings_provider as "openai" | "local") || "openai",
    });

    setLoading(false);
  };

  if (loading) return <Loading />;

  return <Dashboard>{children}</Dashboard>;
}
