'use client';

import { useEffect, useState } from 'react';
import { ChromeAI } from "@langchain/community/experimental/llms/chrome_ai";

interface ChromeAISetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

// 缓存检测结果
let cachedCheckResult: {
  isAvailable: boolean;
  error: string | null;
} | null = null;

export function ChromeAISetup({ onComplete, onCancel }: ChromeAISetupProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isChromeAIAvailable, setIsChromeAIAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkChromeAI = async () => {
      try {
        // 如果有缓存的检测结果，直接使用
        if (cachedCheckResult) {
          setIsChromeAIAvailable(cachedCheckResult.isAvailable);
          setErrorMessage(cachedCheckResult.error);
          setIsChecking(false);
          return;
        }

        // 创建一个临时实例来测试
        const testInstance = new ChromeAI();
        
        // 尝试进行一个简单的测试调用
        await testInstance.call("test");
        
        // 缓存成功结果
        cachedCheckResult = {
          isAvailable: true,
          error: null
        };
        setIsChromeAIAvailable(true);
        setErrorMessage(null);
      } catch (error: any) {
        console.error('Chrome AI 检测失败:', error);
        // 缓存失败结果
        cachedCheckResult = {
          isAvailable: false,
          error: error.message || '未知错误'
        };
        setIsChromeAIAvailable(false);
        setErrorMessage(error.message || '未知错误');
      } finally {
        setIsChecking(false);
      }
    };

    checkChromeAI();
  }, []);

  if (isChecking) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-300">检查 Chrome AI 状态...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chrome AI 设置</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isChromeAIAvailable ? 'Chrome AI 已启用' : 'Chrome AI 状态检查'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {isChromeAIAvailable 
                  ? '太好了！您的浏览器已经支持 Chrome AI，可以获得更好的本地模型性能。'
                  : errorMessage || '无法检测 Chrome AI 状态。您可以继续使用，如果遇到问题，请访问 chromeai.org 了解更多信息。'}
              </p>
              {!isChromeAIAvailable && (
                <a
                  href="https://chromeai.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  了解更多
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          >
            取消
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            继续使用
          </button>
        </div>
      </div>
    </div>
  );
} 