"use client";

import { ExportFormat } from "@/types";

interface ExportFormatSelectorProps {
  selectedFormat: ExportFormat;
  onChange: (format: ExportFormat) => void;
  onExport?: () => void;
  isExporting?: boolean;
  disabled?: boolean;
}

export default function ExportFormatSelector({
  selectedFormat,
  onChange,
  onExport,
  isExporting = false,
  disabled = false,
}: ExportFormatSelectorProps) {
  const formats: { value: ExportFormat; label: string; icon: string }[] = [
    { value: "playwright-ts", label: "Playwright (TypeScript)", icon: "🎭" },
    { value: "playwright-js", label: "Playwright (JavaScript)", icon: "🎭" },
    { value: "cypress-ts", label: "Cypress (TypeScript)", icon: "🌲" },
    { value: "cypress-js", label: "Cypress (JavaScript)", icon: "🌲" },
    { value: "puppeteer-ts", label: "Puppeteer (TypeScript)", icon: "🎪" },
    { value: "puppeteer-js", label: "Puppeteer (JavaScript)", icon: "🎪" },
    { value: "selenium-ts", label: "Selenium (TypeScript)", icon: "🔬" },
    { value: "selenium-js", label: "Selenium (JavaScript)", icon: "🔬" },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
        Export Format
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        Select the testing framework and language for your generated tests
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formats.map((format) => (
          <button
            key={format.value}
            onClick={() => onChange(format.value)}
            disabled={disabled}
            className={`flex items-center p-5 border-2 rounded-xl transition-all hover:shadow-lg ${
              selectedFormat === format.value
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-lg ring-2 ring-indigo-500/20"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="text-3xl mr-4">{format.icon}</span>
            <span className="font-bold text-sm text-left text-slate-900 dark:text-slate-100">
              {format.label}
            </span>
          </button>
        ))}
      </div>

      {onExport && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onExport}
            disabled={disabled || isExporting}
            className={`px-8 py-4 text-lg font-bold rounded-xl transition-all shadow-lg ${
              disabled || isExporting
                ? "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/50 hover:shadow-xl hover:scale-105"
            }`}
          >
            {isExporting ? (
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
                Exporting...
              </span>
            ) : (
              `Export ${
                formats.find((f) => f.value === selectedFormat)?.label ||
                "Tests"
              }`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
