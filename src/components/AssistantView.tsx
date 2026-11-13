import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  MapPin,
  Calendar,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import type { Facility } from '../types/index.ts';

interface AssistantViewProps {
  onSelectFacilityForBooking: (facility: Facility) => void;
  onOpenFacilityModal: (facility: Facility) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  matchedFacilities?: Facility[];
}

const SUGGESTED_QUERIES = [
  'Where can I play badminton this evening?',
  'What are the shoe rules for Block 28 Squash court?',
  'Is the Olympic swimming pool open on Sundays?',
  'How do I book cricket practice nets in East Sector?',
  'Where is the central gym and what are its timings?',
];

export const AssistantView: React.FC<AssistantViewProps> = ({
  onSelectFacilityForBooking,
  onOpenFacilityModal,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your **KHELO LPU Sports Concierge**.\n\nI can help you find where to play badminton, swimming timings, indoor footwear requirements, squash rules, or guide you through demo slot reservations across Lovely Professional University's sports complexes.`,
      timestamp: 'Just now',
      source: 'lpu-knowledge-engine',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to query AI assistant');
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        matchedFacilities: data.matchedFacilities,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'I could not retrieve an answer right now. You can browse all verified campus sports facilities directly in the Directory tab.',
          timestamp: 'Just now',
          source: 'error-fallback',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-[#CCFF00] text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          AI Sports Assistant (Gemini 3.8 Flash)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Campus Sports Concierge
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg mx-auto">
          Ask natural-language questions about sports facilities, access regulations, equipment availability, or slot timings at Lovely Professional University.
        </p>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center sm:text-left">
          Suggested queries for students:
        </span>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {SUGGESTED_QUERIES.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition text-left cursor-pointer"
            >
              "{sq}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-[#0D172A] rounded-2xl border border-slate-800 shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'bg-blue-600/30 text-[#CCFF00] border border-[#CCFF00]/40'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#1E293B] text-white border border-slate-700'
                    : 'bg-[#080E1E] text-slate-200 border border-slate-800'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Direct Facility Cards Attached to Bot Answer */}
                {m.matchedFacilities && m.matchedFacilities.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold text-[#CCFF00] uppercase tracking-wider block">
                      Recommended Campus Arenas:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {m.matchedFacilities.map((fac) => (
                        <div
                          key={fac.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-white text-xs block">{fac.name}</span>
                            <span className="text-[11px] text-slate-400 block">
                              {fac.campusBlock} • {fac.publishedQuantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => onOpenFacilityModal(fac)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => onSelectFacilityForBooking(fac)}
                              className="px-2.5 py-1 rounded-lg bg-[#CCFF00] text-[11px] font-bold text-black hover:bg-[#B8E600]"
                            >
                              Reserve
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{m.timestamp}</span>
                  {m.source && (
                    <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">
                      Engine: {m.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-[#CCFF00] border border-[#CCFF00]/40 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="rounded-2xl p-3 bg-[#080E1E] text-slate-400 text-xs border border-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping" />
                <span>Checking verified LPU facility records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything (e.g. 'Where can I play badminton this evening?')..."
              className="flex-1 bg-[#080E1E] border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#CCFF00]"
              disabled={loading}
              aria-label="Ask KHELO LPU sports assistant"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-5 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-extrabold text-xs uppercase tracking-wider transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
              aria-label="Send sports query"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Grounded on verified LPU Sports Board & DSW campus records. Server-side API.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
