"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface CodeViewerProps {
  code: {
    pomFile: string;
    testFile: string;
    fixturesFile: string;
    constantsFile: string;
    typesFile: string;
    basePageFile: string;
  };
}

export default function CodeViewer({ code }: CodeViewerProps) {
  const [activeTab, setActiveTab] = useState<keyof typeof code>("testFile");

  const tabs: { key: keyof typeof code; label: string; filename: string }[] = [
    { key: "testFile", label: "Test File", filename: "page.spec.ts" },
    { key: "pomFile", label: "Page Object", filename: "Page.ts" },
    { key: "fixturesFile", label: "Fixtures", filename: "fixtures.ts" },
    { key: "basePageFile", label: "Base Page", filename: "BasePage.ts" },
    { key: "typesFile", label: "Types", filename: "types.ts" },
    { key: "constantsFile", label: "Constants", filename: "constants.ts" },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code[activeTab]);
      alert("Code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                  : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-700">
        <span className="text-slate-300 text-sm font-mono font-medium">
          {tabs.find((t) => t.key === activeTab)?.filename}
        </span>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
        >
          📋 Copy Code
        </button>
      </div>

      <Editor
        height="600px"
        language="typescript"
        value={code[activeTab]}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
