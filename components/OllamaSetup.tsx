import React, { useState, useEffect } from 'react';

interface OllamaSetupProps {
  onComplete: (config: { endpoint: string; model: string }) => void;
  onCancel: () => void;
}

interface OllamaModel {
  name: string;
  size: number;
  digest: string;
  modified_at: string;
}

export function OllamaSetup({ onComplete, onCancel }: OllamaSetupProps) {
  const [step, setStep] = useState<'endpoint' | 'model'>('endpoint');
  const [endpoint, setEndpoint] = useState('http://localhost:11434');
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkEndpoint(endpoint: string) {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${endpoint}/api/tags`);
      if (!response.ok) throw new Error('无法连接到服务器');
      const models = await response.json();
      setAvailableModels(models.models || []);
      setStep('model');
    } catch (err) {
      setError('无法连接到 Ollama 服务，请确保服务已启动且地址正确');
    } finally {
      setLoading(false);
    }
  }

  async function downloadModel(modelName: string) {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${endpoint}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: modelName }),
      });
      if (!response.ok) throw new Error('下载模型失败');
      setSelectedModel(modelName);
      const tagsResponse = await fetch(`${endpoint}/api/tags`);
      if (tagsResponse.ok) {
        const models = await tagsResponse.json();
        setAvailableModels(models.models || []);
      }
    } catch (err) {
      setError('下载模型时出错，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl p-6 rounded-lg border border-blue-100 bg-blue-50">
      <div className="mb-6">
        <h3 className="text-xl font-medium text-blue-900 mb-2 flex items-center">
          <span className="text-2xl mr-2">🤖</span>
          {step === 'endpoint' ? '让我们开始配置本地模型服务' : '选择一个模型'}
        </h3>
        <p className="text-blue-700">
          {step === 'endpoint' 
            ? '首先，请告诉我 Ollama 服务的地址。这通常是在本地运行的服务。'
            : '太好了！我已经连接到服务器了。现在让我们选择一个要使用的模型。'}
        </p>
      </div>

      {step === 'endpoint' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-1">
              服务地址
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full p-2 rounded border border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="http://localhost:11434"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-blue-700 hover:bg-blue-100 rounded"
            >
              取消
            </button>
            <button
              onClick={() => checkEndpoint(endpoint)}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? '检查中...' : '下一步'}
            </button>
          </div>
        </div>
      )}

      {step === 'model' && (
        <div className="space-y-4">
          {availableModels.length > 0 ? (
            <div className="grid gap-3">
              {availableModels.map((model) => (
                <button
                  key={model.name}
                  onClick={() => onComplete({ endpoint, model: model.name })}
                  className="p-4 rounded border border-blue-200 hover:border-blue-500 text-left"
                >
                  <div className="font-medium text-blue-900">{model.name}</div>
                  <div className="text-sm text-blue-600">
                    大小: {Math.round(model.size / 1024 / 1024 / 1024)}GB
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-blue-700">
                看起来你还没有安装任何模型。让我帮你下载一个优秀的模型：
              </p>
              <button
                onClick={() => downloadModel('qwen2.5:7b')}
                disabled={loading}
                className="w-full p-4 rounded border border-blue-200 hover:border-blue-500 text-left"
              >
                <div className="font-medium text-blue-900">Qwen2.5-7B</div>
                <div className="text-sm text-blue-600">
                  通义千问2.5，支持中英文的强大模型
                </div>
              </button>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setStep('endpoint')}
              className="px-4 py-2 text-blue-700 hover:bg-blue-100 rounded"
            >
              返回
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          <div className="font-medium">遇到了一点问题：</div>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
} 