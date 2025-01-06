import React, { useState } from 'react';

interface WebLLMConfig {
  model: string;
  temperature?: number;
}

interface WebLLMSetupProps {
  onComplete: (config: WebLLMConfig) => void;
  onCancel: () => void;
  currentConfig?: WebLLMConfig;
}

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  size: string;
  category: string;
  quantization: string;
  context?: number;
  new?: boolean;
}

const AVAILABLE_MODELS: ModelInfo[] = [
  // Phi 系列
  {
    id: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    name: "Phi-3.5 Mini",
    description: "轻量级指令模型，适合基本对话和简单任务",
    size: "2GB",
    category: "Phi",
    quantization: "4-bit",
    context: 2048
  },
  {
    id: "Phi-3.5-instruct-q4f16_1-MLC",
    name: "Phi-3.5",
    description: "标准指令模型，适合一般对话和复杂任务",
    size: "4GB",
    category: "Phi",
    quantization: "4-bit",
    context: 2048
  },
  {
    id: "Phi-3.5-instruct-q8f16_1-MLC",
    name: "Phi-3.5 (8-bit)",
    description: "高精度标准指令模型，适合需要更高准确度的任务",
    size: "6GB",
    category: "Phi",
    quantization: "8-bit",
    context: 2048
  },

  // Mistral 系列
  {
    id: "Mistral-7B-instruct-q4f16_1-MLC",
    name: "Mistral-7B",
    description: "高性能指令模型，适合高级对话和专业任务",
    size: "4GB",
    category: "Mistral",
    quantization: "4-bit",
    context: 4096
  },
  {
    id: "Mistral-7B-instruct-q8f16_1-MLC",
    name: "Mistral-7B (8-bit)",
    description: "高精度高性能指令模型，适合要求高准确度的专业任务",
    size: "7GB",
    category: "Mistral",
    quantization: "8-bit",
    context: 4096
  },

  // Gemma 系列
  {
    id: "Gemma-2b-instruct-q4f16_1-MLC",
    name: "Gemma-2B",
    description: "Google 开源的轻量级指令模型，适合快速响应",
    size: "1.5GB",
    category: "Gemma",
    quantization: "4-bit",
    context: 2048,
    new: true
  },
  {
    id: "Gemma-7b-instruct-q4f16_1-MLC",
    name: "Gemma-7B",
    description: "Google 开源的标准指令模型，平衡性能和资源占用",
    size: "4GB",
    category: "Gemma",
    quantization: "4-bit",
    context: 4096,
    new: true
  },
  {
    id: "Gemma-7b-instruct-q8f16_1-MLC",
    name: "Gemma-7B (8-bit)",
    description: "Google 开源的高精度标准指令模型",
    size: "7GB",
    category: "Gemma",
    quantization: "8-bit",
    context: 4096,
    new: true
  },

  // Qwen 系列
  {
    id: "Qwen1.5-0.5b-instruct-q4f16_1-MLC",
    name: "Qwen1.5-0.5B",
    description: "通义千问超轻量级模型，适合移动设备",
    size: "0.5GB",
    category: "Qwen",
    quantization: "4-bit",
    context: 2048,
    new: true
  },
  {
    id: "Qwen1.5-1.8b-instruct-q4f16_1-MLC",
    name: "Qwen1.5-1.8B",
    description: "通义千问轻量级模型，适合一般对话",
    size: "1.2GB",
    category: "Qwen",
    quantization: "4-bit",
    context: 2048,
    new: true
  },
  {
    id: "Qwen1.5-4b-instruct-q4f16_1-MLC",
    name: "Qwen1.5-4B",
    description: "通义千问中型模型，适合复杂对话",
    size: "2.5GB",
    category: "Qwen",
    quantization: "4-bit",
    context: 4096,
    new: true
  },
  {
    id: "Qwen1.5-7b-instruct-q4f16_1-MLC",
    name: "Qwen1.5-7B",
    description: "通义千问标准模型，适合高级任务",
    size: "4GB",
    category: "Qwen",
    quantization: "4-bit",
    context: 8192,
    new: true
  }
];

const MODEL_CATEGORIES = ["Qwen", "Gemma", "Phi", "Mistral"];

export function WebLLMSetup({ onComplete, onCancel, currentConfig }: WebLLMSetupProps) {
  const [selectedModel, setSelectedModel] = useState<string>(
    currentConfig?.model || AVAILABLE_MODELS[0].id
  );
  const [temperature, setTemperature] = useState<number>(
    currentConfig?.temperature || 0.7
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 这里可以添加模型验证或预下载逻辑
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
              <div key={category} className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{category} 系列</h3>
                <div className="space-y-3">
                  {AVAILABLE_MODELS.filter(model => model.category === category).map((model) => (
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
                          <span>{model.context}k 上下文</span>
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