import axios, { AxiosInstance } from 'axios';

let apiClientInstance: AxiosInstance | null = null;

export function createApiClient(baseURL: string): AxiosInstance {
  if (apiClientInstance && apiClientInstance.defaults.baseURL === baseURL) {
    return apiClientInstance;
  }

  apiClientInstance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });

  apiClientInstance.interceptors.request.use(
    (config) => {
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClientInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return apiClientInstance;
}

export function getApiClient(baseURL: string): AxiosInstance {
  if (!apiClientInstance || apiClientInstance.defaults.baseURL !== baseURL) {
    return createApiClient(baseURL);
  }
  return apiClientInstance;
}

