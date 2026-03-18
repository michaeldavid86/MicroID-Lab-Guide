import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { useSessionStore } from "../stores/useSessionStore";
import { Send, Bot, User, Trash2, StopCircle, Info } from "lucide-react";

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-usafa-blue" : "bg-slate-200 dark:bg-slate-600"
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
        isUser
          ? "bg-usafa-blue text-white rounded-tr-sm"
          : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-600"
      }`}>
        {message.content || <span className="italic opacity-50">typing…</span>}
      </div>
    </div>
  );
}

export default function AIChat() {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Build session context for the AI (never reveal organism ID)
  const currentPhase = useSessionStore((s) => s.currentPhase);
  const gramStain = useSessionStore((s) => s.gramStain);
  const candidateIds = useSessionStore((s) => s.candidateIds);
  const testResults = useSessionStore((s) => s.testResults);
  const flowchartSectionId = useSessionStore((s) => s.flowchartSectionId);

  const sessionContext = {
    currentPhase,
    gramReaction: gramStain.reaction,
    gramShape: gramStain.shape,
    flowchartSection: flowchartSectionId,
    testsCompleted: Object.keys(testResults).length,
    candidatesRemaining: candidateIds.length,
    recentTests: Object.keys(testResults).slice(-3),
    // NEVER include proposedOrganismId or organism name in context
  };

  const { messages, isLoading, error, sendMessage, clearChat, stopGeneration } = useChat(sessionContext);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasApiKey = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-usafa-blue" />
          <div>
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Bio 431 Teaching Assistant</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Socratic guidance · First Principles · Never reveals the answer</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* API key warning */}
      {!hasApiKey && (
        <div className="flex items-start gap-2 m-4 p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-700 rounded-xl text-sm text-amber-800 dark:text-amber-200">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">API Key Not Configured</p>
            <p className="text-xs mt-0.5">Add <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_ANTHROPIC_API_KEY=sk-ant-...</code> to your <code>.env</code> file and restart the dev server.</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 py-8">
            <Bot className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Bio 431 Teaching Assistant</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Ask "why" questions about test results, media, and bacterial physiology. Get help troubleshooting. Connect microbiology to the mission.
            </p>
            <div className="space-y-2 w-full max-w-xs">
              {[
                "Why does S. aureus produce coagulase?",
                "My Gram stain looks purple AND pink — what went wrong?",
                "Why is E. coli the indicator organism for water quality?",
                "What does it mean if my KIA tube turned alkaline on the slant?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus(); }}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors border border-blue-200 dark:border-blue-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => <MessageBubble key={i} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about test principles, troubleshoot results, connect to operations..."
            rows={2}
            disabled={!hasApiKey || isLoading}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-usafa-blue outline-none disabled:opacity-50"
          />
          {isLoading ? (
            <button
              onClick={stopGeneration}
              className="p-2.5 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || !hasApiKey}
              className="p-2.5 bg-usafa-blue text-white rounded-xl disabled:opacity-40 hover:bg-usafa-blue-light transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 text-center">
          Per USAFA GenAI Policy (Level 4): document AI assistance in your lab report.
        </p>
      </div>
    </div>
  );
}
