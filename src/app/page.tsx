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

    // Add user message to UI
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    const { output } = await chatWithAgent([...messages, userMessage]);
    console.log("output", output)
    const stream = readStreamableValue(output);

    const assistantId = crypto.randomUUID();

    // Add empty assistant placeholder
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    let content = '';

    for await (const chunk of stream) {
      console.log("chunk", chunk)

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
    <div className="min-h-screen flex mx-auto flex-col p-4 bg-gray-100 text-black max-w-3xl">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-md whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-blue-400 ml-auto text-white max-w-xl'
                : 'bg-white text-blue-700 mr-auto max-w-[90%]'
            }`}
          >
            <strong>{m.role === 'user' ? 'You' : 'AI'}:</strong>
            {m.role === 'assistant' ? (
              <ReactMarkdown>{m.content}</ReactMarkdown>
            ) : (
              <div className="mt-1">{m.content}</div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2 mt-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Plan your trip..."
          className="flex-1 p-3 border rounded shadow-sm text-black"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}