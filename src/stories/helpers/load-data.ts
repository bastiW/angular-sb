import { getBaseUrl } from './base-url';

export async function loadData<T>(
  endpoint: string,
  expectedType: 'json' | 'text' | 'blob',
) {
  // Construct the full URL by appending the endpoint to the base URL.
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not fetch data, status: ${response.status}`);
  }

  // Use the provided type if it's set.
  if (expectedType === 'json') {
    return (await response.json()) as T;
  }

  if (expectedType === 'text') {
    return (await response.text()) as unknown as T;
  }

  if (expectedType === 'blob') {
    return (await response.blob()) as unknown as T;
  }
  throw new Error('Could not load data');
}
