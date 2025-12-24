"use client";

import { APICall } from "@/types";

interface APICallsViewerProps {
  apiCalls: APICall[];
}

export default function APICallsViewer({ apiCalls }: APICallsViewerProps) {
  if (!apiCalls || apiCalls.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
          API Calls
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          No API calls detected on this page.
        </p>
      </div>
    );
  }

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
      POST: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
      PUT: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
      DELETE: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
      PATCH:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    };
    return (
      colors[method] ||
      "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300"
    );
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "text-green-600 dark:text-green-400";
    if (status >= 300 && status < 400)
      return "text-blue-600 dark:text-blue-400";
    if (status >= 400 && status < 500)
      return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          API Calls Detected
        </h2>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-base font-bold px-4 py-2 rounded-xl">
          {apiCalls.length} {apiCalls.length === 1 ? "call" : "calls"}
        </span>
      </div>

      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
        API endpoints detected during page analysis. These can be used to
        generate mock responses.
      </p>

      <div className="space-y-4">
        {apiCalls.map((call, index) => (
          <div
            key={index}
            className="border-2 border-slate-200 dark:border-slate-700 rounded-xl p-5 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-bold ${getMethodColor(
                    call.method
                  )}`}
                >
                  {call.method}
                </span>
                <code className="text-sm font-mono bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg text-slate-900 dark:text-slate-100 font-medium">
                  {call.url}
                </code>
              </div>
              <span
                className={`text-base font-bold ${getStatusColor(call.status)}`}
              >
                {call.status}
              </span>
            </div>

            {call.requestBody && (
              <details className="mt-4">
                <summary className="cursor-pointer text-base font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                  Request Body
                </summary>
                <pre className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm overflow-x-auto font-mono text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  {JSON.stringify(call.requestBody, null, 2)}
                </pre>
              </details>
            )}

            {call.responseBody && (
              <details className="mt-4">
                <summary className="cursor-pointer text-base font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                  Response Body
                </summary>
                <pre className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm overflow-x-auto font-mono text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700">
                  {JSON.stringify(call.responseBody, null, 2)}
                </pre>
              </details>
            )}

            {call.mockResponse && (
              <div className="mt-3">
                <span className="text-xs font-medium text-gray-600 bg-purple-50 px-2 py-1 rounded">
                  Mock available
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h3>
        <p className="text-sm text-blue-800">
          Enable "Include API Mocks" in the configuration to generate mock
          handlers for these endpoints.
        </p>
      </div>
    </div>
  );
}
