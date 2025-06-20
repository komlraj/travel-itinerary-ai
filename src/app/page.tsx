'use client';

import { useState, useEffect, useRef } from 'react';
import { readStreamableValue } from 'ai/rsc';
import ReactMarkdown from 'react-markdown';
import { chatWithAgent } from './actions';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const { output } = await chatWithAgent([...messages, userMessage]);
    const stream = readStreamableValue(output);
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    let content = '';

    for await (const chunk of stream) {
      content += chunk;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content } : msg
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
          ✈️ Travel Itinerary Planner
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Ask me to plan a trip, suggest hotels, or check weather — just like a travel buddy.
        </p>
      </header>

      {/* Chat Messages */}
      <div className="w-full max-w-2xl flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-md text-sm sm:text-base whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-blue-500 ml-auto text-white max-w-[85%]'
                : 'bg-white text-blue-700 mr-auto max-w-[85%]'
            }`}
          >
            <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong>{' '}
            {m.role === 'assistant' ? (
              <ReactMarkdown>
                {m.content}
              </ReactMarkdown>
            ) : (
              <span>{m.content}</span>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="w-full max-w-2xl flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g., Plan a 4-day Manali trip in July"
          className="flex-1 p-3 rounded border shadow-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}