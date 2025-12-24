"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-4xl transform group-hover:scale-110 transition-transform">
              🎭
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Playwright Test Generator
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                AI-Powered Test Automation
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <a
              href="https://playwright.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span>📚</span>
              <span>Docs</span>
            </a>
            <a
              href="https://github.com/CGunasekaran"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <span>⭐</span>
              <span>GitHub</span>
            </a>
            <a
              href="https://gunasekaran-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Portfolio
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
