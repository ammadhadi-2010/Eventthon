import axios from 'axios';
import { resolveApiBaseUrl } from '../../api/apiBase';

const aiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
});

export async function askAiAssistant(question) {
  const cleaned = String(question || '').trim();
  if (!cleaned) {
    throw new Error('Please enter a question.');
  }

  const { data } = await aiClient.post('/api/ai-assistant/ask', { question: cleaned });
  const answer = String(data?.answer || '').trim();
  if (!answer) {
    throw new Error('AI returned an empty response. Please try again.');
  }
  return answer;
}
