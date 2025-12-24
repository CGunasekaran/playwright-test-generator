"use client";

import { TestTemplate } from "@/types";

interface TestTemplateSelectorProps {
  selectedTemplates: TestTemplate[];
  onChange: (templates: TestTemplate[]) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
}

export default function TestTemplateSelector({
  selectedTemplates,
  onChange,
  onGenerate,
  isGenerating = false,
  disabled = false,
}: TestTemplateSelectorProps) {
  const templates: {
    value: TestTemplate;
    label: string;
    description: string;
  }[] = [
    {
      value: "snapshot",
      label: "Snapshot Tests",
      description: "Basic page object model and snapshot tests",
    },
    {
      value: "e2e",
      label: "E2E Tests",
      description: "End-to-end user flow tests",
    },
    {
      value: "component",
      label: "Component Tests",
      description: "Individual component testing",
    },
    {
      value: "accessibility",
      label: "Accessibility Tests",
      description: "WCAG compliance and a11y tests",
    },
    {
      value: "performance",
      label: "Performance Tests",
      description: "Core Web Vitals and load time tests",
    },
    {
      value: "api",
      label: "API Tests",
      description: "API endpoint validation tests",
    },
    {
      value: "visual-regression",
      label: "Visual Regression",
      description: "Screenshot comparison tests",
    },
    {
      value: "cross-browser",
      label: "Cross-Browser",
      description: "Multi-browser compatibility tests",
    },
    {
      value: "mobile",
      label: "Mobile Tests",
      description: "Mobile viewport and responsive tests",
    },
  ];

  const handleToggle = (template: TestTemplate) => {
    if (selectedTemplates.includes(template)) {
      onChange(selectedTemplates.filter((t) => t !== template));
    } else {
      onChange([...selectedTemplates, template]);
    }
  };

  const handleSelectAll = () => {
    onChange(templates.map((t) => t.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Test Templates
        </h2>
        <div className="flex gap-3">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-800 font-semibold transition-all"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-all"
          >
            Clear All
          </button>
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        Choose which types of tests to generate for your application
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <label
            key={template.value}
            className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplates.includes(template.value)
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg ring-2 ring-indigo-500/20"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={selectedTemplates.includes(template.value)}
                onChange={() => handleToggle(template.value)}
                disabled={disabled}
                className="mt-1 h-5 w-5 text-indigo-600 dark:text-indigo-400 rounded-md focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              />
              <div className="ml-4 flex-1">
                <span className="font-bold text-slate-900 dark:text-slate-100 block text-lg">
                  {template.label}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400 mt-2 block leading-relaxed">
                  {template.description}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {onGenerate && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => {
              console.log("Generate Tests button clicked!", {
                selectedTemplates,
                hasOnGenerate: !!onGenerate,
              });
              if (onGenerate) {
                onGenerate();
              }
            }}
            disabled={
              disabled || isGenerating || selectedTemplates.length === 0
            }
            className={`px-8 py-4 text-lg font-bold rounded-xl transition-all shadow-lg ${
              disabled || isGenerating || selectedTemplates.length === 0
                ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-500/50 hover:shadow-xl hover:scale-105"
            }`}
          >
            {isGenerating ? (
              <span className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                Generating Tests...
              </span>
            ) : (
              `Generate Tests (${selectedTemplates.length} selected)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
