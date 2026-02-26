import React, { useState } from 'react';
import { MessageCircle, X, Send, Leaf, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

const quickQuestions = [
  'How can I reduce catering emissions?',
  'Best sustainable venue options?',
  'Tips for zero-waste events',
  'How to offset carbon?',
];

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      content: "Hi! I'm your GreenConnect AI assistant. I can help you with sustainable event planning tips, carbon reduction strategies, and eco-friendly alternatives. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getResponse = (question: string): string => {
    const q = question.toLowerCase();
    if (q.includes('cater') || q.includes('food') || q.includes('menu') || q.includes('f&b')) {
      return "Great question! Here are top strategies for reducing catering emissions:\n\n1. **Go plant-forward** — A vegan menu produces ~67% less carbon than meat-heavy options\n2. **Source locally** — Partner with farms within 50 miles to cut transport emissions by 40%\n3. **Reduce food waste** — Use accurate headcounts and donate leftovers to local shelters\n4. **Compostable servingware** — Switch from single-use plastics to compostable alternatives\n5. **Seasonal menus** — Use in-season ingredients to avoid energy-intensive greenhouse growing\n\nWould you like specific vendor recommendations?";
    }
    if (q.includes('venue') || q.includes('location') || q.includes('space')) {
      return "Here are the best sustainable venue strategies:\n\n1. **Choose LEED-certified venues** — They use 25% less energy on average\n2. **Outdoor venues** — Natural lighting and ventilation reduce energy use by 50%+\n3. **Renewable energy** — Look for venues powered by solar or wind energy\n4. **Smart HVAC** — Venues with smart thermostats reduce energy waste by 30%\n5. **Proximity to transit** — Choose venues near public transportation hubs\n\nShall I help you evaluate a specific venue?";
    }
    if (q.includes('zero waste') || q.includes('waste') || q.includes('recycle')) {
      return "Achieving zero waste is ambitious but achievable! Here's your roadmap:\n\n1. **Digital-first** — Replace all printed materials with QR codes and event apps\n2. **Reusable decor** — Rent decorations or use living plants that can be replanted\n3. **Waste stations** — Set up clearly labeled compost, recycling, and landfill bins\n4. **No swag bags** — Replace with digital gift cards or tree-planting donations\n5. **Composting** — Partner with local composting services for food waste\n6. **Measure & track** — Use waste audits to identify and eliminate waste sources\n\nMany events have achieved 90%+ diversion rates with these strategies!";
    }
    if (q.includes('offset') || q.includes('carbon') || q.includes('neutral')) {
      return "Carbon offsetting is a great complement to reduction efforts:\n\n1. **Calculate first** — Use our calculator to know your exact footprint\n2. **Reduce first, offset the rest** — Offsetting shouldn't replace reduction\n3. **Verified programs** — Look for Gold Standard or VCS certified offsets\n4. **Local projects** — Support reforestation or renewable energy in your region\n5. **Transparency** — Share your offset details with attendees\n\nTypical offset costs: $10-50 per ton of CO₂. For a 100-person event, this might be $50-200.\n\nWant me to calculate your specific offset needs?";
    }
    if (q.includes('transport') || q.includes('travel') || q.includes('shuttle')) {
      return "Transport often accounts for 40-60% of event emissions. Here's how to tackle it:\n\n1. **Shuttle services** — Reduce individual car trips by 40%\n2. **Carpooling platform** — Set up a ride-sharing board for attendees\n3. **Transit incentives** — Offer free transit passes or subsidized rides\n4. **EV charging** — Install temporary charging stations at the venue\n5. **Hybrid options** — Allow remote attendance to reduce travel\n6. **Bike parking** — Encourage cycling with secure bike storage\n\nFor international events, consider carbon-offset flight programs.";
    }
    return "That's a great question about sustainable event planning! Here are some general tips:\n\n1. **Start with measurement** — Use our carbon calculator to establish your baseline\n2. **Focus on big wins** — Transport and F&B typically have the largest impact\n3. **Engage attendees** — Share your sustainability goals and get buy-in\n4. **Set targets** — Aim for specific reduction percentages each event\n5. **Document everything** — Track your progress for continuous improvement\n\nFeel free to ask me about specific categories like venue, catering, transport, or materials for detailed recommendations!";
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const response = getResponse(messageText);
      const assistantMsg: Message = { id: Date.now() + 1, role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-105 ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-300'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '500px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Eco Assistant</h4>
              <p className="text-emerald-200 text-xs">Powered by AI</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-emerald-600" />
                  </div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-700 rounded-bl-md'
                }`}>
                  {msg.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line.startsWith('**') ? (
                        <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                      ) : (
                        line
                      )}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-md p-3 flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sustainable events..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
