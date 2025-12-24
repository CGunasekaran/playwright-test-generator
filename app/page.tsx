"use client";

import { useState, useRef } from "react";
import URLInput from "./components/URLInput";
import ElementTree from "./components/ElementTree";
import CodeViewer from "./components/CodeViewer";
import DownloadButton from "./components/DownloadButton";
import TestTemplateSelector from "./components/TestTemplateSelector";
import ExportFormatSelector from "./components/ExportFormatSelector";
import VisualRegressionSettings from "./components/VisualRegressionSettings";
import InteractionRecorder from "./components/InteractionRecorder";
import Modal from "./components/Modal";
import {
  PageAnalysis,
  TestTemplate,
  ExportFormat,
  VisualRegressionConfig,
  UserFlow,
} from "@/types";

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<PageAnalysis | null>(null);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const generatedCodeRef = useRef<HTMLDivElement>(null);

  // Configuration state
  const [selectedTemplates, setSelectedTemplates] = useState<TestTemplate[]>([
    "snapshot",
  ]);
  const [exportFormat, setExportFormat] =
    useState<ExportFormat>("playwright-ts");
  const [includeAPIMocks, setIncludeAPIMocks] = useState(false);
  const [includeVisualRegression, setIncludeVisualRegression] = useState(false);
  const [detectedFlows, setDetectedFlows] = useState<UserFlow[]>([]);
  const [visualConfig, setVisualConfig] = useState<VisualRegressionConfig>({
    provider: "playwright",
    projectName: "my-app",
    threshold: 0.2,
    enableOnCI: false,
  });
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info" as "info" | "error" | "warning" | "success",
  });

  const showModal = (
    title: string,
    message: string,
    type: "info" | "error" | "warning" | "success" = "info"
  ) => {
    setModalState({ isOpen: true, title, message, type });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setGeneratedCode(null);
    setCurrentUrl(url);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze page");
      }

      const data: PageAnalysis = await response.json();
      setAnalysis(data);

      // Automatically generate code after analysis
      await generateCode(data);
    } catch (error: any) {
      console.error("Error analyzing URL:", error);
      showModal(
        "Analysis Failed",
        error.message || "Failed to analyze URL. Please try again.",
        "error"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateCode = async (
    analysisData: PageAnalysis,
    overrideOptions?: {
      templates?: TestTemplate[];
      format?: ExportFormat;
    }
  ) => {
    console.log("generateCode called", {
      hasAnalysis: !!analysisData,
      templates: overrideOptions?.templates ?? selectedTemplates,
      format: overrideOptions?.format ?? exportFormat,
    });
    setIsGenerating(true);

    const startTime = Date.now();

    try {
      const requestBody = {
        analysis: analysisData,
        userFlows: detectedFlows,
        options: {
          format: overrideOptions?.format ?? exportFormat,
          templates: overrideOptions?.templates ?? selectedTemplates,
          includeAPIMocks,
          includeVisualRegression,
          visualConfig,
          projectName: visualConfig.projectName,
        },
      };

      console.log("Sending request to /api/generate-code", requestBody);

      const response = await fetch("/api/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      const code = await response.json();
      console.log("Received generated code", { hasCode: !!code });

      // Ensure minimum 1 second loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1000 - elapsedTime);

      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      setGeneratedCode(code);

      // Scroll to Generated Test Code section after a short delay
      setTimeout(() => {
        generatedCodeRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error: any) {
      console.error("Error generating code:", error);
      showModal(
        "Code Generation Failed",
        error.message || "Failed to generate code. Please try again.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateCode = () => {
    console.log("handleRegenerateCode called", { analysis: !!analysis });
    if (analysis) {
      generateCode(analysis);
    } else {
      showModal(
        "No Page Analyzed",
        "Please analyze a page first by entering a URL above.",
        "warning"
      );
    }
  };

  const handleGenerateFromTemplates = () => {
    console.log("handleGenerateFromTemplates called", {
      templates: selectedTemplates,
      hasAnalysis: !!analysis,
    });
    if (selectedTemplates.length === 0) {
      showModal(
        "No Templates Selected",
        "Please select at least one test template.",
        "warning"
      );
      return;
    }
    if (analysis) {
      // If we already have analysis, just regenerate
      generateCode(analysis);
    } else {
      // Prompt user to enter URL first
      showModal(
        "No Page Analyzed",
        "Please enter a URL above to analyze the page first.",
        "info"
      );
    }
  };

  const handleExportFormat = () => {
    console.log("handleExportFormat called", { analysis: !!analysis });
    if (analysis) {
      generateCode(analysis);
    } else {
      showModal(
        "No Page Analyzed",
        "Please enter a URL above to analyze and generate tests.",
        "info"
      );
    }
  };

  const handleFlowsDetected = (flows: UserFlow[]) => {
    setDetectedFlows(flows);
    // Automatically regenerate code with new flows
    if (analysis) {
      generateCode(analysis);
    }
  };

  const handleTemplateChange = (templates: TestTemplate[]) => {
    setSelectedTemplates(templates);
    // Code will be generated when user clicks "Generate Tests" button
  };

  const handleFormatChange = (format: ExportFormat) => {
    setExportFormat(format);
    // Code will be generated when user clicks "Export" button
  };

  const pageName =
    analysis?.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") || "Page";

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <URLInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

        {/* Configuration Options - Show before analysis */}
        {!analysis && !isAnalyzing && (
          <div className="space-y-6 mt-8">
            <TestTemplateSelector
              selectedTemplates={selectedTemplates}
              onChange={handleTemplateChange}
              onGenerate={handleGenerateFromTemplates}
              isGenerating={isGenerating}
              disabled={false}
            />

            <ExportFormatSelector
              selectedFormat={exportFormat}
              onChange={handleFormatChange}
              onExport={handleExportFormat}
              isExporting={isGenerating}
              disabled={false}
            />

            <div className="flex items-center space-x-4 bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeAPIMocks"
                  checked={includeAPIMocks}
                  onChange={(e) => setIncludeAPIMocks(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="includeAPIMocks"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Include API Mocks
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeVisualRegression"
                  checked={includeVisualRegression}
                  onChange={(e) => setIncludeVisualRegression(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="includeVisualRegression"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Include Visual Regression Tests
                </label>
              </div>
            </div>

            {includeVisualRegression && (
              <VisualRegressionSettings
                config={visualConfig}
                onChange={setVisualConfig}
              />
            )}
          </div>
        )}

        {(isAnalyzing || isGenerating) && (
          <div className="text-center py-16">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-lg text-white font-medium">
                {isAnalyzing
                  ? "Analyzing page structure..."
                  : "Generating test code..."}
              </p>
              <p className="text-sm text-white/80 mt-2">
                This may take a minute for complex pages
              </p>
            </div>
          </div>
        )}

        {analysis && !isAnalyzing && (
          <div className="space-y-8">
            {/* Interaction Recorder */}
            <InteractionRecorder
              url={currentUrl}
              onFlowsDetected={handleFlowsDetected}
              onError={(message) =>
                showModal("Interaction Detection Failed", message, "error")
              }
            />

            {/* Configuration Options - Show after analysis with regenerate button */}
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold">Test Configuration</h2>
                <button
                  onClick={handleRegenerateCode}
                  disabled={isGenerating}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isGenerating ? "Regenerating..." : "Regenerate Tests"}
                </button>
              </div>

              <TestTemplateSelector
                selectedTemplates={selectedTemplates}
                onChange={handleTemplateChange}
                onGenerate={handleRegenerateCode}
                isGenerating={isGenerating}
                disabled={false}
              />

              <ExportFormatSelector
                selectedFormat={exportFormat}
                onChange={handleFormatChange}
                onExport={handleRegenerateCode}
                isExporting={isGenerating}
                disabled={false}
              />

              <div className="flex items-center space-x-4 bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeAPIMocks2"
                    checked={includeAPIMocks}
                    onChange={(e) => setIncludeAPIMocks(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="includeAPIMocks2"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Include API Mocks
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includeVisualRegression2"
                    checked={includeVisualRegression}
                    onChange={(e) =>
                      setIncludeVisualRegression(e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="includeVisualRegression2"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Include Visual Regression Tests
                  </label>
                </div>
              </div>

              {includeVisualRegression && (
                <VisualRegressionSettings
                  config={visualConfig}
                  onChange={setVisualConfig}
                />
              )}
            </div>

            {/* Page Preview */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Page Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <img
                  src={analysis.screenshot}
                  alt="Page screenshot"
                  className="w-full"
                />
              </div>
            </div>

            {/* Element Analysis */}
            <ElementTree analysis={analysis} />

            {/* Generated Code */}
            {generatedCode && (
              <div ref={generatedCodeRef} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">Generated Test Code</h2>
                  <DownloadButton code={generatedCode} pageName={pageName} />
                </div>
                <CodeViewer code={generatedCode} />
              </div>
            )}
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No page analyzed yet
            </h3>
            <p className="text-gray-500">
              Enter a URL above to generate Playwright tests
            </p>
          </div>
        )}
      </div>
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
      />
    </main>
  );
}
