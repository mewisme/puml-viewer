export type AIProvider = 'openai' | 'google' | 'megallm' | 'custom';

export interface AIProviderConfig {
  baseUrl: string;
  models: string[];
}

export const DEFAULT_API_URL = 'https://spuml.mewis.me';

export const APP_CONFIG = {
  name: 'PUML Viewer',
  version: '0.0.5',
  description: 'A mobile application for viewing and rendering PlantUML diagrams. Create, preview, and manage your PlantUML diagrams on the go.',
  author: 'Mew',
  defaultApiUrl: DEFAULT_API_URL,
  links: {
    github: 'https://github.com/mewisme',
    pumlViewer: 'https://github.com/mewisme/puml-viewer',
    pumlServer: 'https://github.com/mewisme/puml-server',
  },
  technologies: ['Expo', 'React Native', 'TypeScript', 'NativeWind'],
  ai: {
    providers: {
      openai: {
        baseUrl: 'https://api.openai.com/v1',
        models: [
          'gpt-5',
          'gpt-5-mini',
          'gpt-4.1',
          'gpt-4o',
          'gpt-4o-mini',
          'gpt-4-turbo',
          'gpt-4',
          'gpt-3.5-turbo'
        ],
      },
      google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
      },
      megallm: {
        baseUrl: 'https://ai.megallm.io/v1',
        models: [
          'gpt-5',
          'gpt-5-mini',
          'gpt-4',
          'gpt-4.1',
          'gpt-4o',
          'gpt-3.5-turbo',
          'claude-3.5-sonnet',
          'claude-sonnet-4-5-20250929',
          'gemini-2.5-pro',
          'gemini-2.5-flash',
          'deepseek-r1-distill-llama-70b',
          'llama3-8b-instruct',
          'llama3.3-70b-instruct',
          'alibaba-qwen3-32b',
          'deepseek-ai/deepseek-v3.1',
          'deepseek-ai/deepseek-v3.1-terminus',
          'glm-4.6',
          'minimaxai/minimax-m2',
          'mistralai/mistral-nemotron',
          'moonshotai/kimi-k2-instruct-0905',
          'qwen/qwen3-next-80b-a3b-instruct'
        ],
      },
      custom: {
        baseUrl: '',
        models: [],
      },
    } as Record<AIProvider, AIProviderConfig>,
    defaultProvider: 'openai' as AIProvider,
    defaultModel: 'gpt-4o',
    defaultStream: true,
  },
} as const;

