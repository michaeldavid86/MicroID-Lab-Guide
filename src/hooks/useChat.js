// MicroID Field Guide — AI Chat Hook
// Bio 431: Operational Microbiology | USAFA

import { useState, useCallback, useRef } from "react";
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "../data/systemPrompt";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || "",
  dangerouslyAllowBrowser: true,
});

export function useChat(sessionContext = null) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (userText) => {
      if (!userText.trim() || isLoading) return;

      const userMsg = { role: "user", content: userText.trim() };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setIsLoading(true);
      setError(null);

      // Placeholder for streaming assistant message
      const assistantPlaceholder = { role: "assistant", content: "" };
      setMessages([...newMessages, assistantPlaceholder]);

      try {
        const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
        if (!apiKey) {
          throw new Error("No API key configured. Add VITE_ANTHROPIC_API_KEY to your .env file.");
        }

        const stream = client.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: buildSystemPrompt(sessionContext),
          messages: newMessages,
        });

        abortRef.current = stream;
        let fullText = "";

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
            fullText += event.delta.text;
            setMessages([
              ...newMessages,
              { role: "assistant", content: fullText },
            ]);
          }
        }

        setMessages([
          ...newMessages,
          { role: "assistant", content: fullText },
        ]);
      } catch (err) {
        if (err.name === "AbortError") return;
        const errMsg = err.message || "An error occurred communicating with the AI assistant.";
        setError(errMsg);
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: `⚠️ Error: ${errMsg}\n\nCheck your API key in the .env file and try again.`,
          },
        ]);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading, sessionContext]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort?.();
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, error, sendMessage, clearChat, stopGeneration };
}
