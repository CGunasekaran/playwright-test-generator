"use client";

import { useState } from "react";
import { UserFlow } from "@/types";

interface InteractionRecorderProps {
  url: string;
  onFlowsDetected: (flows: UserFlow[]) => void;
  onError?: (message: string) => void;
}

export default function InteractionRecorder({
  url,
  onFlowsDetected,
  onError,
}: InteractionRecorderProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFlows, setDetectedFlows] = useState<UserFlow[]>([]);

  const detectInteractions = async () => {
    setIsDetecting(true);
    try {
      const response = await fetch("/api/detect-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to detect interactions");
      }

      const { flows } = await response.json();
      setDetectedFlows(flows);
      onFlowsDetected(flows);
    } catch (error: any) {
      console.error("Error detecting interactions:", error);
      if (onError) {
        onError(error.message || "Failed to detect interactions");
      }
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Interaction Detection
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        Automatically detect common user flows and interaction patterns
      </p>

      <button
        onClick={detectInteractions}
        disabled={isDetecting || !url}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {isDetecting ? (
          <span className="flex items-center justify-center gap-3">
            <svg
              className="animate-spin h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Detecting Interactions...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            🔍 Detect User Flows
          </span>
        )}
      </button>

      {detectedFlows.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
            Detected Flows ({detectedFlows.length})
          </h3>
          <div className="space-y-3">
            {detectedFlows.map((flow, index) => (
              <div
                key={index}
                className="p-5 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:shadow-lg"
              >
                <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  {flow.name}
                </div>
                <div className="text-base text-slate-600 dark:text-slate-400 mt-1">
                  {flow.description}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                  {flow.steps.length} steps • {flow.expectedAPICalls.length} API
                  calls
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
