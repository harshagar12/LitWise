// API configuration utility
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // If the endpoint already starts with http, return as is (for external APIs)
  if (endpoint.startsWith('http')) {
    return endpoint
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  return `${API_BASE_URL}/${cleanEndpoint}`
}

// Helper function for making API requests
export const apiRequest = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint)
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
} 