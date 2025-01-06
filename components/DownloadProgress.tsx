import React from 'react';

interface DownloadProgressProps {
  progress: number;
  stage: 'preparing' | 'downloading' | 'loading' | 'complete';
  modelName: string;
  text?: string;
}

export function DownloadProgress({ progress, stage, modelName, text }: DownloadProgressProps) {
  const percentage = Math.round(progress * 100);
  
  const stageMessages = {
    preparing: '我正在准备下载模型...',
    downloading: `我正在下载 ${modelName} 模型权重，请稍候...`,
    loading: '正在加载模型到内存中...',
    complete: '太好了！模型已经准备就绪！'
  };

  const stageEmojis = {
    preparing: '🔍',
    downloading: '📥',
    loading: '⚡',
    complete: '✨'
  };

  return (
    <div className="w-full max-w-2xl p-6 rounded-lg border border-blue-100 bg-blue-50">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{stageEmojis[stage]}</span>
        <div className="flex-1">
          <h3 className="font-medium text-blue-900 mb-1">
            {text || stageMessages[stage]}
          </h3>
          <div className="text-sm text-blue-700">
            {stage !== 'complete' ? `已完成 ${percentage}%` : '100% 完成'}
          </div>
        </div>
      </div>

      <div className="relative w-full h-2 bg-blue-100 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {stage === 'downloading' && (
        <div className="mt-3 text-sm text-blue-600">
          <span className="animate-pulse">⚡</span> 下载速度可能因网络状况而异，请保持耐心...
        </div>
      )}

      {stage === 'loading' && (
        <div className="mt-3 text-sm text-blue-600">
          <span className="animate-pulse">💫</span> 马上就好，我正在进行最后的准备...
        </div>
      )}

      {text && stage !== 'complete' && (
        <div className="mt-3 text-sm text-blue-600">
          <span className="animate-pulse">ℹ️</span> {text}
        </div>
      )}
    </div>
  );
} 