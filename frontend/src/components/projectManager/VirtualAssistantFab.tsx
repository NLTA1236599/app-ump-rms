import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { ResearchProject } from './types.js';
import {
  VIRTUAL_ASSISTANT_FAB_PANEL_MAX_WIDTH,
  VIRTUAL_ASSISTANT_FAB_Z_INDEX,
} from './virtualAssistantFabLayout.js';

export type VirtualAssistantFabProps = {
  projects: ResearchProject[];
  /** Gọi API trợ lý; mặc định trả lời cục bộ nếu không truyền. */
  chatHandler?: (query: string, projects: ResearchProject[]) => Promise<string>;
};
async function defaultLocalReply(query: string): Promise<string> {
  const trimmed = query.trim();
  if (!trimmed) return 'Xin hãy nhập câu hỏi.';
  return `Tạm thời trợ lý đang hoạt động ngoại tuyến. Yêu cầu: "${trimmed.slice(0, 120)}${trimmed.length > 120 ? '…' : ''}" — có thể kết nối dịch vụ AI sau qua prop chatHandler.`;
}

export function VirtualAssistantFab({ projects, chatHandler }: VirtualAssistantFabProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: 'Chào bạn! Tôi là Trợ lý ảo UMP. Tôi có thể giúp gì cho bạn về các đề tài nghiên cứu?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;
    const q = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    const handler = chatHandler ?? defaultLocalReply;
    const answer = await handler(q, projects);
    setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    setLoading(false);
  };

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[35] flex flex-col items-end md:bottom-10 md:right-10"
      style={{ zIndex: VIRTUAL_ASSISTANT_FAB_Z_INDEX }}
    >
      <div
        className="pointer-events-auto"
        style={{ maxWidth: VIRTUAL_ASSISTANT_FAB_PANEL_MAX_WIDTH }}
      >
        {isOpen ? (
          <div
            className="mb-2 flex max-h-[min(480px,70vh)] w-full flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-2xl animate-slideUp md:mb-4 md:rounded-[32px]"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white md:p-5">
              <div className="flex items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md md:h-10 md:w-10 md:rounded-2xl">
                  <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider md:text-sm">Trợ lý ảo UMP</h3>
                  <p className="text-[9px] font-bold text-blue-100 opacity-80 md:text-[10px]">Đang hỗ trợ nhanh</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-1.5 transition hover:bg-white/10"
                aria-label="Thu gọn chat"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="max-h-[320px] space-y-3 overflow-y-auto bg-slate-50/50 p-4 md:max-h-[400px] md:space-y-4 md:p-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-[11px] font-medium leading-relaxed shadow-sm md:p-4 md:text-xs ${
                      msg.role === 'user'
                        ? 'rounded-tr-none bg-blue-600 text-white'
                        : 'rounded-tl-none border border-slate-100 bg-white text-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-1 rounded-2xl rounded-tl-none border border-slate-100 bg-white p-3">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0.15s]" />
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:0.3s]" />
                  </div>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-2 border-t border-slate-100 bg-white p-3 md:p-4"
            >
              <input
                type="text"
                placeholder="Câu hỏi của bạn..."
                className="flex-1 rounded-xl border-none bg-slate-50 px-3 py-2.5 text-xs font-medium outline-none transition focus:ring-2 focus:ring-blue-100 md:rounded-2xl md:px-4 md:py-3"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700 active:scale-95 disabled:bg-slate-200 md:rounded-2xl md:p-3"
                aria-label="Gửi"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group flex items-center space-x-3 rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-800 px-4 py-3 text-white shadow-2xl transition hover:shadow-blue-200/50 active:scale-95 md:rounded-[32px] md:px-6 md:py-4 ${
            isOpen ? 'pointer-events-none scale-95 opacity-0' : ''
          }`}
        >
          <div className="relative">
            <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="absolute right-0 top-0 h-2 w-2 animate-ping rounded-full border-2 border-white bg-red-500" />
          </div>
          <div className="hidden text-left md:block">
            <span className="block text-xs font-black uppercase leading-none tracking-widest">Trợ lý ảo UMP</span>
            <span className="text-[10px] font-bold text-blue-200">Tôi có thể giúp gì cho bạn?</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest md:hidden">UMP AI</span>
        </button>
      </div>
    </div>
  );
}
