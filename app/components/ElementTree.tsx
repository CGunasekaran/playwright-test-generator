"use client";

import { PageAnalysis } from "@/types";
import { useState } from "react";

interface ElementTreeProps {
  analysis: PageAnalysis;
}

export default function ElementTree({ analysis }: ElementTreeProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-slate-100">
        Page Analysis
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
            Total Elements
          </p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {analysis.metadata.totalElements}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-5 rounded-xl border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-700 dark:text-green-300 font-semibold">
            Test IDs
          </p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
            {analysis.metadata.testIds}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold">
            Interactive
          </p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {analysis.metadata.interactiveElements}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-5 rounded-xl border border-orange-200 dark:border-orange-800">
          <p className="text-sm text-orange-700 dark:text-orange-300 font-semibold">
            Forms
          </p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {analysis.metadata.forms}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {analysis.sections.map((section) => (
          <div
            key={section.name}
            className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg transition-all"
          >
            <button
              onClick={() => toggleSection(section.name)}
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {section.name}
                </span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-full">
                  {section.elements.length} elements
                </span>
              </div>
              <svg
                className={`w-6 h-6 transition-transform text-slate-600 dark:text-slate-400 ${
                  expandedSections.has(section.name) ? "rotate-180" : ""
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

            {expandedSections.has(section.name) && (
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto bg-white dark:bg-slate-800">
                {section.elements.map((element, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                        {element.uniqueName}
                      </code>
                      <span className="text-xs bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full font-semibold text-slate-700 dark:text-slate-300">
                        {element.tagName}
                      </span>
                    </div>
                    {element.testId && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        <span className="font-bold">Test ID:</span>{" "}
                        {element.testId}
                      </p>
                    )}
                    {element.classes.length > 0 && (
                      <p className="text-xs text-gray-600 mb-1">
                        <span className="font-semibold">Classes:</span>{" "}
                        {element.classes.slice(0, 3).join(", ")}
                      </p>
                    )}
                    <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
                      {element.selector}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
