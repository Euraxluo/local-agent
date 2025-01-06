import { ChatOllama } from "@langchain/ollama";
import { ChatWindowMessage } from "@/schema/ChatWindowMessage";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { CreateMLCEngine, MLCEngine, type MLCEngineConfig } from "@mlc-ai/web-llm";
import { ChromeAI } from "@langchain/community/experimental/llms/chrome_ai";

interface WorkerMessage {
  messages: ChatWindowMessage[];
  modelProvider: "ollama" | "webllm" | "chrome_ai";
  modelConfig: {
    baseUrl?: string;
    temperature?: number;
    model?: string;
    chatOptions?: {
      temperature?: number;
    };
  };
  action?: "clear";
}

interface ProgressCallback {
  progress: number;
  text?: string;
}

// 保存 WebLLM 实例以便重用
let webllmInstance: MLCEngine | null = null;

// Chrome AI 相关函数
let chromeAIInstance: ChromeAI | null = null;

// Chrome AI 相关常量
const CHROME_AI_SYSTEM_TEMPLATE = `You are a helpful AI assistant. Please provide a response based on the following conversation history and the user's latest question.
Maintain a friendly and professional tone.

Conversation history:
{conversation_history}

User's question: {question}

Assistant:`;

async function initializeChromeAI() {
  try {
    // // @ts-ignore
    // if (!globalThis?.chrome?.ml) {
    //   throw new Error('Chrome AI API (chrome.ml) 不可用');
    // }

    // // 检查 generateText 功能
    // // @ts-ignore
    // if (typeof globalThis.chrome.ml.generateText !== 'function') {
    //   throw new Error('Chrome AI 文本生成功能不可用');
    // }

    // 尝试创建实例
    if (!chromeAIInstance) {
      chromeAIInstance = new ChromeAI();

      // 验证实例
      try {
        // 进行一个简单的测试调用
        await chromeAIInstance.call("test");
      } catch (testError: any) {
        throw new Error('Chrome AI 模型测试失败: ' + (testError.message || '未知错误'));
      }
    }
    return true;
  } catch (err: any) {
    console.error('初始化 Chrome AI 失败:', err);
    chromeAIInstance = null; // 确保实例被清理
    throw new Error('Chrome AI 初始化失败: ' + (err.message || '未知错误'));
  }
}

async function generateChromeAIResponse(messages: ChatWindowMessage[]) {
  try {
    await initializeChromeAI();
    if (!chromeAIInstance) {
      throw new Error('Chrome AI 实例未初始化');
    }

    // 构建对话历史
    const conversationHistory = messages.slice(0, -1)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // 获取最后一条消息
    const lastMessage = messages[messages.length - 1].content;

    // 构建完整的提示词
    const prompt = CHROME_AI_SYSTEM_TEMPLATE
      .replace('{conversation_history}', conversationHistory)
      .replace('{question}', lastMessage);

    try {
      // 尝试使用流式处理
      const stream = await chromeAIInstance.stream(prompt);

      let accumulatedText = '';
      for await (const chunk of stream) {
        if (chunk) {
          // 移除可能的前缀
          const cleanedChunk = chunk.replace(/^(Assistant|助手):\s*/i, '');
          accumulatedText += cleanedChunk;

          self.postMessage({
            type: "chunk",
            data: cleanedChunk,
          });
        }
      }

      if (!accumulatedText) {
        throw new Error('生成响应为空');
      }
    } catch (streamError: any) {
      console.error('Chrome AI 流式生成失败，尝试使用非流式调用:', streamError);
      
      // 如果流式处理失败，回退到普通调用
      const response = await chromeAIInstance.call(prompt);
      
      if (response) {
        // 移除可能的前缀
        const cleanedResponse = response.replace(/^(Assistant|助手):\s*/i, '');
        self.postMessage({
          type: "chunk",
          data: cleanedResponse,
        });
      } else {
        throw new Error('生成响应为空');
      }
    }
  } catch (err: any) {
    console.error('Chrome AI 生成响应失败:', err);
    throw new Error('Chrome AI 生成响应失败: ' + (err.message || '未知错误'));
  }
}

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { messages, modelProvider, modelConfig, action } = e.data;
  console.log('Worker received message:', e.data);

  try {
    // 处理清空上下文的请求
    if (action === "clear") {
      console.log('清空聊天记录和上下文...');
      
      // 清除所有实例
      webllmInstance = null;
      chromeAIInstance = null;
      
      self.postMessage({ 
        type: "complete",
        data: "聊天记录已清空"
      });
      return;
    }

    if (!messages || messages.length === 0) {
      throw new Error('没有要处理的消息');
    }

    if (modelProvider === 'chrome_ai') {
      console.log('使用 Chrome AI 处理请求...');
      await generateChromeAIResponse(messages);
    } else if (modelProvider === 'webllm') {
      if (!modelConfig.model) {
        throw new Error('WebLLM 模型名称是必需的');
      }
      console.log('正在初始化 WebLLM...', modelConfig.model);
      
      try {
        // 如果没有实例或者模型改变了，创建新的实例
        if (!webllmInstance) {
          webllmInstance = await CreateMLCEngine(modelConfig.model, {
            initProgressCallback: (progress: any) => {
              console.log('WebLLM 初始化进度:', progress);
              self.postMessage({
                type: "init_progress",
                data: {
                  progress: typeof progress === 'number' ? progress : (progress.progress || 0),
                  text: typeof progress === 'object' ? progress.text : '正在加载模型...'
                }
              });
            }
          });
        }

        // 使用 WebLLM 的 chat.completions.create 方法
        const response = await webllmInstance.chat.completions.create({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          stream: true,
          model: modelConfig.model,
          temperature: modelConfig.temperature
        });

        for await (const chunk of response) {
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            self.postMessage({
              type: "chunk",
              data: chunk.choices[0].delta.content,
            });
          }
        }
      } catch (error) {
        console.error('WebLLM error:', error);
        // 如果发生错误，清除实例
        webllmInstance = null;
        throw error;
      }
    } else if (modelProvider === 'ollama') {
      if (!modelConfig.baseUrl) {
        throw new Error('Ollama baseUrl is required');
      }
      if (!modelConfig.model) {
        throw new Error('Ollama model name is required');
      }

      // 创建 Ollama 实例
      const model = new ChatOllama({
        baseUrl: modelConfig.baseUrl,
        model: modelConfig.model,
        temperature: modelConfig.temperature ?? 0.7,
      });

      // Ollama 使用 LangChain 的 stream 方法
      const formattedMessages = messages.map(msg => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });

      console.log('Sending request with messages:', formattedMessages);

      const stream = await model.stream(formattedMessages);
      for await (const chunk of stream) {
        console.log('Received chunk:', chunk);
        self.postMessage({
          type: "chunk",
          data: chunk.content || chunk.text || '',
        });
      }
    } else {
      throw new Error(`不支持的模型提供者: ${modelProvider}`);
    }

    self.postMessage({ type: "complete" });
  } catch (error) {
    console.error('Worker error:', error);
    let errorMessage = '发生未知错误';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (modelProvider === 'ollama') {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '无法连接到 Ollama 服务器。请确保 Ollama 正在运行并且可访问。';
        } else if (error.message.includes('no such model')) {
          errorMessage = '找不到指定的模型。请确保已下载所需的模型。';
        }
      } else if (modelProvider === 'webllm') {
        if (error.message.includes('WebGPU')) {
          errorMessage = '您的浏览器不支持 WebGPU。请使用支持 WebGPU 的浏览器，比如最新版的 Chrome。';
        } else if (error.message.includes('download')) {
          errorMessage = '模型下载失败，请检查网络连接并重试。';
        } else if (error.message.includes('memory')) {
          errorMessage = '内存不足，无法加载模型。请关闭一些标签页后重试。';
        } else if (error.message.includes('device lost')) {
          errorMessage = 'GPU 设备丢失。这可能是由于内存不足或其他硬件问题导致的。';
        }
      } else if (modelProvider === 'chrome_ai') {
        if (error.message.includes('Chrome AI 不可用')) {
          errorMessage = 'Chrome AI 不可用。请确保您使用的是支持 Chrome AI 的 Chrome 浏览器版本。';
        } else if (error.message.includes('untested language')) {
          errorMessage = '当前语言不被 Chrome AI 支持。请尝试使用英文进行对话，或切换到其他模型。';
        } else if (error.message.includes('生成响应失败')) {
          errorMessage = 'Chrome AI 生成响应失败。请检查浏览器设置并确保已启用 Chrome AI。';
        }
      }
    }

    // 如果发生错误，也清除 WebLLM 实例
    webllmInstance = null;

    self.postMessage({
      type: "error",
      error: errorMessage
    });
  }
};
