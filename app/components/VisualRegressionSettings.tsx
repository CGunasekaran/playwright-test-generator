"use client";

import { VisualRegressionConfig } from "@/types";
import { useState } from "react";

interface VisualRegressionSettingsProps {
  config: VisualRegressionConfig;
  onChange: (config: VisualRegressionConfig) => void;
}

export default function VisualRegressionSettings({
  config,
  onChange,
}: VisualRegressionSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const providers: {
    value: VisualRegressionConfig["provider"];
    label: string;
  }[] = [
    { value: "playwright", label: "Playwright (Built-in)" },
    { value: "percy", label: "Percy" },
    { value: "applitools", label: "Applitools" },
    { value: "chromatic", label: "Chromatic" },
    { value: "backstop", label: "BackstopJS" },
  ];

  const updateConfig = (updates: Partial<VisualRegressionConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Visual Regression Settings
        </h2>
        <button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          <svg
            className={`w-7 h-7 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-8 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Visual Testing Provider
            </label>
            <select
              value={config.provider}
              onChange={(e) =>
                updateConfig({ provider: e.target.value as any })
              }
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
            >
              {providers.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Project Name
            </label>
            <input
              type="text"
              value={config.projectName}
              onChange={(e) => updateConfig({ projectName: e.target.value })}
              placeholder="my-app-visual-tests"
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
            />
          </div>

          {/* API Key (for cloud providers) */}
          {["percy", "applitools", "chromatic"].includes(config.provider) && (
            <div>
              <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ""}
                onChange={(e) => updateConfig({ apiKey: e.target.value })}
                placeholder="Your API key"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                API key will be stored in environment variables
              </p>
            </div>
          )}

          {/* Baseline Folder */}
          {["playwright", "backstop"].includes(config.provider) && (
            <div>
              <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Baseline Folder
              </label>
              <input
                type="text"
                value={config.baselineFolder || ""}
                onChange={(e) =>
                  updateConfig({ baselineFolder: e.target.value })
                }
                placeholder="tests/visual-regression/baselines"
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
              />
            </div>
          )}

          {/* Threshold */}
          <div>
            <label className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Difference Threshold (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={config.threshold || 0.2}
              onChange={(e) =>
                updateConfig({ threshold: parseFloat(e.target.value) })
              }
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-slate-100 font-medium transition-all"
            />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Acceptable difference ratio (0 = exact match, 1 = any difference)
            </p>
          </div>

          {/* Enable on CI */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableOnCI"
              checked={config.enableOnCI || false}
              onChange={(e) => updateConfig({ enableOnCI: e.target.checked })}
              className="h-5 w-5 text-indigo-600 dark:text-indigo-400 rounded-md focus:ring-indigo-500 focus:ring-offset-2"
            />
            <label
              htmlFor="enableOnCI"
              className="ml-3 text-base text-slate-700 dark:text-slate-300 font-medium"
            >
              Enable visual tests on CI/CD
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
