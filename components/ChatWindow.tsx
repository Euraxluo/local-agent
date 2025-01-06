"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Id, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';

import { ChatMessageBubble } from '@/components/ChatMessageBubble';
import { ChatWindowMessage } from '@/schema/ChatWindowMessage';
import { DownloadProgress } from '@/components/DownloadProgress';
import { StorageService } from '@/lib/storage';
import { OllamaSetup } from '@/components/OllamaSetup';
import { WebLLMSetup } from '@/components/WebLLMSetup';
import { ChromeAISetup } from '@/components/ChromeAISetup';
import { useLocalStorage } from '@/lib/hooks';

type ModelProvider = "ollama" | "webllm" | "chrome_ai";

type EmojiType = string | JSX.Element;

interface ModelConfig {
  baseUrl?: string;
  temperature?: number;
  model?: string;
  chatOptions?: {
    temperature?: number;
  };
}

interface WorkerMessage {
  type: 'log' | 'init_progress' | 'chunk' | 'error' | 'complete';
  data?: any;
  error?: string;
}

interface AgentMessage {
  type: 'error' | 'info' | 'warning';
  title: string;
  content: string;
}

type OllamaStatus = 'unknown' | 'connecting' | 'connected' | 'error';

interface OllamaConfig {
  endpoint: string;
  model: string;
}

interface WebLLMConfig {
  model: string;
  temperature?: number;
}

const titleTexts: Record<ModelProvider, string> = {
  ollama: "本地模型聊天",
  webllm: "浏览器内聊天",
  chrome_ai: "Chrome原生聊天",
};

export function ChatWindow(props: {
  placeholder?: string;
}) {
  const searchParams = useSearchParams()
  const presetProvider = searchParams.get("provider");
  const validModelProviders: ModelProvider[] = ["ollama", "webllm", "chrome_ai"];
  
  // 在组件内部定义 emojis，并使用 useMemo 缓存
  const emojis = useMemo<Record<ModelProvider, EmojiType>>(() => ({
    ollama: "🦙",
    webllm: "🌐",
    chrome_ai: <Image src="/images/chrome-ai.svg" alt="Chrome AI" width={24} height={24} className="inline-block" />
  }), []);

  // 使用 useLocalStorage hook
  const [savedModelProvider, setSavedModelProvider] = useLocalStorage<ModelProvider>(
    'selectedModelProvider',
    validModelProviders.includes(presetProvider as ModelProvider)
      ? (presetProvider as ModelProvider)
      : "ollama"
  );
  
  const [hasShownChromeAISetup, setHasShownChromeAISetup] = useLocalStorage('hasShownChromeAISetup', false);

  const { placeholder } = props;
  const [messages, setMessages] = useState<ChatWindowMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [readyToChat, setReadyToChat] = useState(true);
  const [modelProvider, setModelProvider] = useState<ModelProvider>(savedModelProvider);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStage, setDownloadStage] = useState<'preparing' | 'downloading' | 'loading' | 'complete'>('preparing');
  const [downloadMessage, setDownloadMessage] = useState<string>("");
  const initProgressToastId = useRef<Id | null>(null);
  const titleText = titleTexts[modelProvider];
  const storageService = useRef<StorageService>(new StorageService());
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>('unknown');
  const [agentMessage, setAgentMessage] = useState<AgentMessage | null>(null);
  const [showOllamaSetup, setShowOllamaSetup] = useState(false);
  const [ollamaConfig, setOllamaConfig] = useState<OllamaConfig>({
    endpoint: 'http://localhost:11435',
    model: 'qwen2.5:14b'
  });
  const [showWebLLMSetup, setShowWebLLMSetup] = useState(false);
  const [webllmConfig, setWebLLMConfig] = useState<WebLLMConfig>({
    model: "Phi-3.5-mini-instruct-q4f16_1-MLC",
    temperature: 0.7
  });
  const [showChromeAISetup, setShowChromeAISetup] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 当模型提供者改变时保存
  useEffect(() => {
    setSavedModelProvider(modelProvider);
  }, [modelProvider, setSavedModelProvider]);

  // 检查是否显示 Chrome AI 设置
  useEffect(() => {
    if (modelProvider === 'chrome_ai' && !hasShownChromeAISetup) {
      setShowChromeAISetup(true);
      setHasShownChromeAISetup(true);
    }
  }, [modelProvider, hasShownChromeAISetup, setHasShownChromeAISetup]);

  const modelListItems: Record<ModelProvider, React.ReactElement> = {
    ollama: (
      <li>
        ⚙️
        <span className="ml-2">
          使用 <code>{ollamaConfig.model}</code> 本地模型
          <button
            onClick={() => setShowOllamaSetup(true)}
            className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            配置
          </button>
        </span>
      </li>
    ),
    webllm: (
      <li>
        ⚙️
        <span className="ml-2">
          使用 <code>{webllmConfig.model}</code> 浏览器内模型
          <button
            onClick={() => setShowWebLLMSetup(true)}
            className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            配置
          </button>
        </span>
      </li>
    ),
    chrome_ai: (
      <li>
        ♊
        <span className="ml-2">
          使用 Chrome 内置的 <code>Gemini Nano</code> 模型
          <button
            onClick={() => setShowChromeAISetup(true)}
            className="ml-2 text-blue-500 hover:text-blue-700 text-sm"
          >
            配置
          </button>
        </span>
      </li>
    ),
  };

  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    const initStorage = async () => {
      await storageService.current.init();
      const savedMessages = await storageService.current.getMessages();
      if (savedMessages.length > 0) {
        setMessages(savedMessages);
      }
    };
    initStorage();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      storageService.current.saveMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    if (modelProvider === 'ollama') {
      checkOllamaServer(true);
    } else {
      setAgentMessage(null);
    }
  }, [modelProvider]);

  async function checkOllamaServer(silent: boolean = false) {
    try {
      if (!silent) {
        console.log('🔍 检查 Ollama 服务器状态...');
        setOllamaStatus('connecting');
      }
      const response = await fetch(`${ollamaConfig.endpoint}/api/version`);
      if (!response.ok) throw new Error('Ollama server responded with an error');
      
      const tagsResponse = await fetch(`${ollamaConfig.endpoint}/api/tags`);
      if (!tagsResponse.ok) throw new Error('Failed to fetch models');
      const tags = await tagsResponse.json();
      const modelExists = tags.models?.some((m: any) => m.name === ollamaConfig.model);
      
      if (!modelExists) {
        setOllamaStatus('error');
        if (!silent) {
          setAgentMessage({
            type: 'warning',
            title: '模型未安装或正在下载',
            content: `看起来 ${ollamaConfig.model} 模型还未准备好。如果你刚刚开始下载，请稍等片刻。如果问题持续存在，请点击上方的"配置"按钮重新设置。`,
          });
          return;
        }
        return;
      }

      console.log('✅ Ollama 服务器已连接');
      setOllamaStatus('connected');
      setAgentMessage(null);
    } catch (error) {
      console.error('❌ Ollama 服务器连接失败:', error);
      setOllamaStatus('error');
      if (!silent) {
        setAgentMessage({
          type: 'error',
          title: '连接失败',
          content: '无法连接到 Ollama 服务，请确保服务已启动并点击上方的"配置"按钮重新设置。'
        });
      }
    }
  }

  const handleOllamaSetupComplete = (config: OllamaConfig) => {
    setOllamaConfig(config);
    setShowOllamaSetup(false);
    setTimeout(() => {
      checkOllamaServer(false);
    }, 5000);
  };

  const handleWebLLMSetupComplete = (config: WebLLMConfig) => {
    setWebLLMConfig(config);
    setShowWebLLMSetup(false);
  };

  async function queryStore(messages: ChatWindowMessage[]) {
    if (!worker.current) {
      throw new Error("Worker is not ready.");
    }
    console.log('🚀 开始查询模型...');
    return new ReadableStream({
      start(controller) {
        if (!worker.current) {
          controller.close();
          return;
        }
        const modelConfigs: Record<ModelProvider, ModelConfig> = {
          ollama: {
            baseUrl: ollamaConfig.endpoint,
            temperature: 0.3,
            model: ollamaConfig.model,
          },
          webllm: {
            model: webllmConfig.model,
            chatOptions: {
              temperature: webllmConfig.temperature,
            },
          },
          chrome_ai: {},
        };
        const payload = {
          messages,
          modelProvider,
          modelConfig: modelConfigs[modelProvider],
        };

        console.log('📦 模型配置:', modelConfigs[modelProvider]);
        worker.current?.postMessage(payload);
        
        const onMessageReceived = (e: MessageEvent<WorkerMessage>) => {
          switch (e.data.type) {
            case "log":
              console.log('📝 Worker日志:', e.data);
              break;
            case "init_progress":
              const progress = e.data.data?.progress || 0;
              const percentage = Math.round(progress * 100);
              console.log(`⏳ 下载进度: ${percentage}%`, e.data.data);
              setDownloadProgress(progress);
              
              if (progress === 0) {
                console.log('🔍 准备阶段...');
                setDownloadStage('preparing');
              } else if (progress < 0.9) {
                console.log('📥 下载阶段...');
                setDownloadStage('downloading');
              } else if (progress < 1) {
                console.log('⚡ 加载阶段...');
                setDownloadStage('loading');
              } else {
                console.log('✨ 完成！');
                setDownloadStage('complete');
                setTimeout(() => {
                  setDownloadProgress(0);
                }, 2000);
              }
              break;
            case "chunk":
              console.log('📨 收到响应片段');
              controller.enqueue(e.data.data);
              break;
            case "error":
              worker.current?.removeEventListener("message", onMessageReceived);
              console.error('❌ 错误:', e.data.error);
              const error = new Error(e.data.error);
              controller.error(error);
              break;
            case "complete":
              worker.current?.removeEventListener("message", onMessageReceived);
              console.log('✅ 完成响应');
              controller.close();
              break;
          }
        };
        worker.current?.addEventListener("message", onMessageReceived);
      },
    });
  }

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoading || !input) {
      return;
    }

    if (modelProvider === 'ollama') {
      console.log('🔄 检查 Ollama 状态...');
      if (ollamaStatus === 'unknown' || ollamaStatus === 'error') {
        await checkOllamaServer(false);
      }
      if (ollamaStatus !== 'connected') {
        console.log('❌ Ollama 未连接，无法发送消息');
        return;
      }
    }

    console.log('📤 准备发送消息...');
    const initialInput = input;
    const initialMessages = [...messages];
    const newMessages = [...initialMessages, { role: "user" as const, content: input }];

    setMessages(newMessages)
    setIsLoading(true);
    setInput("");

    try {
      console.log('🚀 开始处理请求...');
      const stream = await queryStore(newMessages);
      const reader = stream.getReader();

      let chunk = await reader.read();

      const aiResponseMessage: ChatWindowMessage = {
        content: "",
        role: "assistant" as const,
      };

      setMessages([...newMessages, aiResponseMessage]);

      while (!chunk.done) {
        aiResponseMessage.content = aiResponseMessage.content + chunk.value;
        setMessages([...newMessages, aiResponseMessage]);
        chunk = await reader.read();
      }

      console.log('✅ 请求处理完成');
      setIsLoading(false);
    } catch (error: any) {
      console.error('❌ 请求失败:', error);
      setMessages(initialMessages);
      setIsLoading(false);
      setInput(initialInput);
      
      if (modelProvider === 'ollama') {
        setAgentMessage({
          type: 'warning',
          title: '通信中断',
          content: '与本地模型的连接似乎出现了问题。我正在尝试重新连接...'
        });
        checkOllamaServer(false);
      } else if (modelProvider === 'chrome_ai' && error.message.includes('untested language')) {
        setAgentMessage({
          type: 'warning',
          title: '语言不支持',
          content: '当前 Chrome AI 模型不支持中文输出。请尝试使用英文进行对话，或切换到其他模型。'
        });
      } else {
        // 根据错误消息类型设置不同的提示
        const isWarning = error.message.includes('不支持') || 
                         error.message.includes('不可用') ||
                         error.message.includes('未准备好');
        
        setAgentMessage({
          type: isWarning ? 'warning' : 'error',
          title: isWarning ? '提示' : '错误',
          content: error.message
        });
      }
    }
  }

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../app/worker.ts', import.meta.url), {
        type: 'module',
      });

      // 处理来自 Worker 的消息
      worker.current.addEventListener('message', async (e) => {
        if (e.data.type === 'check_chrome_ai') {
          try {
            // @ts-ignore
            if (!window.chrome?.ml) {
              worker.current?.postMessage({
                type: 'chrome_ai_status',
                available: false,
                error: 'Chrome AI API 不可用'
              });
              return;
            }

            // 检查 generateText 功能
            // @ts-ignore
            if (typeof window.chrome.ml.generateText !== 'function') {
              worker.current?.postMessage({
                type: 'chrome_ai_status',
                available: false,
                error: 'Chrome AI 文本生成功能不可用'
              });
              return;
            }

            // 测试 Gemini Nano 模型
            try {
              // @ts-ignore
              await window.chrome.ml.generateText({
                modelName: 'gemini-nano',
                text: 'test',
                maxOutputTokens: 1,
              });
              worker.current?.postMessage({
                type: 'chrome_ai_status',
                available: true
              });
            } catch (modelErr) {
              worker.current?.postMessage({
                type: 'chrome_ai_status',
                available: false,
                error: 'Gemini Nano 模型不可用'
              });
            }
          } catch (err: any) {
            worker.current?.postMessage({
              type: 'chrome_ai_status',
              available: false,
              error: err?.message || 'Chrome AI 检测失败'
            });
          }
        } else if (e.data.type === 'generate_chrome_ai') {
          try {
            // @ts-ignore
            const response = await window.chrome.ml.generateText(e.data.data.options);
            if (!response || !response.response) {
              worker.current?.postMessage({
                type: 'chrome_ai_response',
                error: '生成响应为空'
              });
              return;
            }
            worker.current?.postMessage({
              type: 'chrome_ai_response',
              response: response.response
            });
          } catch (err: any) {
            worker.current?.postMessage({
              type: 'chrome_ai_response',
              error: err?.message || 'Chrome AI 生成失败'
            });
          }
        }
      });

      setIsLoading(false);
    }
  }, []);

  const clearChat = async () => {
    console.log('🧹 清空聊天记录...');
    setMessages([]);
    storageService.current.clearMessages();

    if (worker.current) {
      worker.current.postMessage({
        modelProvider,
        modelConfig: {},
        messages: [],
        action: "clear"
      });
    }
  };
  
  return (
    <div className="flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden h-full max-h-screen">
      {isClient ? (
        <>
          <h1 className="text-2xl md:text-4xl font-bold text-center mb-4 flex items-center">
            <span>{emojis[modelProvider]}</span> {titleText}
          </h1>
          
          <div className="flex gap-2 mb-4">
            {validModelProviders.map((provider) => (
              <button
                key={provider}
                className={`px-4 py-2 rounded ${
                  modelProvider === provider
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => setModelProvider(provider)}
              >
                <span>{emojis[provider]}</span> {provider.toUpperCase()}
                {provider === 'ollama' && ollamaStatus === 'connected' && (
                  <span className="ml-2 text-green-400">●</span>
                )}
                {provider === 'ollama' && ollamaStatus === 'error' && (
                  <span className="ml-2 text-red-500">●</span>
                )}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <ul className="list-none space-y-2">
              {modelListItems[modelProvider]}
            </ul>
          </div>

          {agentMessage && (
            <div className={`w-full max-w-2xl mb-4 p-4 rounded-lg border relative ${
              agentMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
              agentMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
              'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <h3 className="font-bold mb-2">{agentMessage.title}</h3>
              <p className="whitespace-pre-line">{agentMessage.content}</p>
              <button
                onClick={() => setAgentMessage(null)}
                className="absolute top-2 right-2 p-1 hover:bg-black/10 rounded-full"
                aria-label="关闭提示"
              >
                <span className="text-current opacity-60 hover:opacity-100">✕</span>
              </button>
            </div>
          )}

          {downloadProgress > 0 && (
            <div className="w-full max-w-2xl mb-4">
              <DownloadProgress 
                progress={downloadProgress} 
                stage={downloadStage}
                modelName={modelProvider === 'webllm' ? 'Phi-3.5' : 'Qwen2.5-14B'}
                text={downloadMessage}
              />
            </div>
          )}

          <div className="flex flex-col w-full max-w-4xl h-[calc(100vh-16rem)] min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">聊天记录</h2>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                >
                  清空聊天
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              {messages.map((message, i) => (
                <ChatMessageBubble key={i} message={message} />
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  开始你的对话吧...
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
              <input
                className="grow rounded p-4 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={input}
                placeholder={placeholder ?? "输入你的问题..."}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              />
              <button
                type="submit"
                className="px-8 py-4 rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "思考中..." : "发送"}
              </button>
            </form>
          </div>

          {showOllamaSetup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <OllamaSetup
                  onComplete={handleOllamaSetupComplete}
                  onCancel={() => setShowOllamaSetup(false)}
                />
              </div>
            </div>
          )}

          {showWebLLMSetup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <WebLLMSetup
                  onComplete={handleWebLLMSetupComplete}
                  onCancel={() => setShowWebLLMSetup(false)}
                  currentConfig={webllmConfig}
                />
              </div>
            </div>
          )}

          {showChromeAISetup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <ChromeAISetup
                onComplete={() => {
                  setShowChromeAISetup(false);
                  setReadyToChat(true);
                }}
                onCancel={() => {
                  setShowChromeAISetup(false);
                }}
              />
            </div>
          )}

          <ToastContainer />
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">加载中...</div>
        </div>
      )}
    </div>
  );
}