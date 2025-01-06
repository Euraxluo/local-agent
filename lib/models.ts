export enum ModelFamily {
  LLAMA = "llama",
  PHI = "phi",
  MISTRAL = "mistral",
  GEMMA = "gemma",
  QWEN = "qwen",
  SMOL_LM = "smollm",
  TINY_LLAMA = "tinyllama",
  QWEN_CODER = "qwen-coder",
  QWEN_MATH = "qwen-math"
}

export interface ModelInfo {
  id: string;
  name: string;
  displayName: string;
  provider: string;
  family: ModelFamily;
  size?: string;
  description?: string;
  category?: string;
  quantization?: string;
  contextSize?: number;
  new?: boolean;
  recommendedConfig?: {
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
  };
}

export const MODEL_CATEGORIES = [
  {
    id: "qwen",
    name: "Qwen",
    description: "Qwen 系列模型",
  },
  {
    id: "qwen-coder",
    name: "Qwen Coder",
    description: "Qwen 代码生成模型",
  },
  {
    id: "qwen-math",
    name: "Qwen Math",
    description: "Qwen 数学推理模型",
  },
  {
    id: "llama",
    name: "Llama",
    description: "Llama 系列模型",
  },
  {
    id: "tinyllama",
    name: "TinyLlama",
    description: "TinyLlama 轻量级模型",
  },
  {
    id: "mistral",
    name: "Mistral",
    description: "Mistral 系列模型",
  },
  {
    id: "phi",
    name: "Phi",
    description: "Phi 系列模型",
  },
  {
    id: "gemma",
    name: "Gemma",
    description: "Gemma 系列模型",
  },
  {
    id: "smollm",
    name: "SmolLM",
    description: "SmolLM 轻量级模型",
  },
];

// 从 web-llm-chat 项目导入的模型列表
export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "Qwen2.5-7B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-7B-Instruct",
    displayName: "Qwen",
    provider: "Alibaba",
    family: ModelFamily.QWEN,
    description: "Qwen 2.5 7B Instruct 模型",
    category: "qwen",
    size: "7B",
    quantization: "Q4F16",
    contextSize: 32,
    recommendedConfig: {
      temperature: 0.7,
      top_p: 0.8,
    },
  },
  {
    id: "SmolLM2-135M-Instruct-q0f16-MLC",
    name: "SmolLM2-135M-Instruct",
    displayName: "SmolLM",
    provider: "HuggingFaceTB",
    family: ModelFamily.SMOL_LM,
    description: "135M 参数的轻量级指令模型",
    category: "smollm",
    size: "135M",
    quantization: "Q0F16",
    contextSize: 4,
    new: true,
    recommendedConfig: {
      temperature: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
    },
  },
  {
    id: "SmolLM2-360M-Instruct-q0f16-MLC",
    name: "SmolLM2-360M-Instruct",
    displayName: "SmolLM",
    provider: "HuggingFaceTB",
    family: ModelFamily.SMOL_LM,
    description: "360M 参数的轻量级指令模型",
    category: "smollm",
    size: "360M",
    quantization: "Q0F16",
    contextSize: 4,
    new: true,
    recommendedConfig: {
      temperature: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
    },
  },
  {
    id: "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
    name: "TinyLlama-1.1B-Chat",
    displayName: "TinyLlama",
    provider: "Zhang Peiyuan",
    family: ModelFamily.TINY_LLAMA,
    description: "1.1B 参数的轻量级聊天模型",
    category: "tinyllama",
    size: "1.1B",
    quantization: "Q4F16",
    contextSize: 4,
    new: true,
    recommendedConfig: {
      temperature: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
    },
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-0.5B-Instruct",
    displayName: "Qwen",
    provider: "Alibaba",
    family: ModelFamily.QWEN,
    description: "阿里巴巴最新的轻量级指令模型",
    category: "qwen",
    size: "0.5B",
    quantization: "Q4F16",
    contextSize: 32,
    new: true,
    recommendedConfig: {
      temperature: 0.7,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 0.8,
    },
  },
  {
    id: "Qwen2.5-Coder-0.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-Coder-0.5B-Instruct",
    displayName: "Qwen Coder",
    provider: "Alibaba",
    family: ModelFamily.QWEN_CODER,
    description: "阿里巴巴的轻量级代码生成模型",
    category: "qwen-coder",
    size: "0.5B",
    quantization: "Q4F16",
    contextSize: 32,
    new: true,
    recommendedConfig: {
      temperature: 0.7,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 0.8,
    },
  },
  {
    id: "Qwen2-Math-1.5B-Instruct-q4f16_1-MLC",
    name: "Qwen2-Math-1.5B-Instruct",
    displayName: "Qwen Math",
    provider: "Alibaba",
    family: ModelFamily.QWEN_MATH,
    description: "阿里巴巴的数学推理模型",
    category: "qwen-math",
    size: "1.5B",
    quantization: "Q4F16",
    contextSize: 32,
    new: true,
    recommendedConfig: {
      temperature: 1.0,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 0.8,
    },
  },
  {
    id: "Phi-3-mini-4k-instruct-q4f16_1-MLC",
    name: "Phi-3-mini",
    displayName: "Phi",
    provider: "Microsoft",
    family: ModelFamily.PHI,
    description: "微软最新的小型高效模型",
    category: "phi",
    size: "3B",
    quantization: "Q4F16",
    contextSize: 4,
    new: true,
    recommendedConfig: {
      temperature: 0.7,
      presence_penalty: 0,
      frequency_penalty: 0,
      top_p: 1,
    },
  },
  {
    id: "Qwen2.5-4B-Instruct-q4f16_1-MLC",
    name: "Qwen2.5-4B-Instruct",
    displayName: "Qwen",
    provider: "Alibaba",
    family: ModelFamily.QWEN,
    description: "Qwen 2.5 4B Instruct 模型",
    category: "qwen",
    size: "4B",
    quantization: "Q4F16",
    contextSize: 32,
    recommendedConfig: {
      temperature: 0.7,
      top_p: 0.8,
    },
  },
  {
    id: "Llama-2-7b-chat-hf-q4f16_1-MLC",
    name: "Llama-2-7B-Chat",
    displayName: "Llama",
    provider: "Meta",
    family: ModelFamily.LLAMA,
    description: "Llama 2 7B Chat 模型",
    category: "llama",
    size: "7B",
    quantization: "Q4F16",
    contextSize: 4,
    recommendedConfig: {
      temperature: 0.6,
      top_p: 0.9,
    },
  },
  {
    id: "Mistral-7B-Instruct-v0.2-q4f16_1-MLC",
    name: "Mistral-7B-Instruct",
    displayName: "Mistral",
    provider: "Mistral AI",
    family: ModelFamily.MISTRAL,
    description: "Mistral 7B Instruct 模型",
    category: "mistral",
    size: "7B",
    quantization: "Q4F16",
    contextSize: 8,
    recommendedConfig: {
      temperature: 0.7,
      top_p: 0.95,
    },
  },
  {
    id: "Phi-2-q4f16_1-MLC",
    name: "Phi-2",
    displayName: "Phi",
    provider: "Microsoft",
    family: ModelFamily.PHI,
    description: "Phi-2 模型",
    category: "phi",
    size: "2.7B",
    quantization: "Q4F16",
    contextSize: 4,
    recommendedConfig: {
      temperature: 0.7,
      top_p: 0.95,
    },
  },
  {
    id: "gemma-2-2b-it-q4f16_1-MLC",
    name: "Gemma-2B-IT",
    displayName: "Gemma",
    provider: "Google",
    family: ModelFamily.GEMMA,
    description: "Gemma 2B IT 模型",
    category: "gemma",
    size: "2B",
    quantization: "Q4F16",
    contextSize: 8,
    recommendedConfig: {
      temperature: 0.7,
      top_p: 0.95,
    },
  },
];

export const DEFAULT_MODEL_ID = "Qwen2.5-0.5B-Instruct-q4f16_1-MLC";
// 默认模型
export const DEFAULT_MODEL = AVAILABLE_MODELS.find(m => m.id === DEFAULT_MODEL_ID); 