import React, { useState } from 'react';
import { AVAILABLE_MODELS, MODEL_CATEGORIES, ModelInfo,DEFAULT_MODEL_ID } from '../lib/models';

interface WebLLMConfig {
  model: string;
  temperature?: number;
}

interface WebLLMSetupProps {
  onComplete: (config: WebLLMConfig) => void;
  onCancel: () => void;
  currentConfig?: WebLLMConfig;
}

export function WebLLMSetup({ onComplete, onCancel, currentConfig }: WebLLMSetupProps) {
  const [selectedModel, setSelectedModel] = useState<string>(
    currentConfig?.model || DEFAULT_MODEL_ID
  );
  const [temperature, setTemperature] = useState<number>(
    currentConfig?.temperature || 0.7
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const config: WebLLMConfig = {
        model: selectedModel,
        temperature: temperature
      };
      onComplete(config);
    } catch (error) {
      console.error('WebLLM setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-3xl w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">WebLLM 设置</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            选择模型
          </label>
          <div className="space-y-6">
            {MODEL_CATEGORIES.map((category) => (
              <div key={category.id} className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{category.name} 系列</h3>
                <div className="space-y-3">
                  {AVAILABLE_MODELS.filter((model: ModelInfo) => model.category === category.id).map((model: ModelInfo) => (
                    <div
                      key={model.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700'
                      }`}
                      onClick={() => setSelectedModel(model.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                            selectedModel === model.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`} />
                          <span className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                            {model.name}
                            {model.new && (
                              <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">新</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{model.size}</span>
                          <span>|</span>
                          <span>{model.quantization}</span>
                          <span>|</span>
                          <span>{model.contextSize}k 上下文</span>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm ml-7">
                        {model.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2">
            温度 ({temperature})
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>更保守</span>
            <span>更创造性</span>
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
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? "配置中..." : "确认"}
          </button>
        </div>
      </form>
    </div>
  );
} 