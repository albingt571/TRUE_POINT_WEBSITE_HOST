import { useState, useRef, useEffect, useCallback } from 'react';

// Company knowledge base for RAG context
const COMPANY_CONTEXT = `
TRUE POINT SURVEY — Company Information & Knowledge Base

=== CONTACT INFORMATION ===
Phone Numbers:
- Primary: +91 7593967016
- Secondary: +91 9645431016

Email Addresses:
- Company Email: truepoint571@gmail.com
- Personal Email (Owner): thaiparambilthomas@gmail.com

WhatsApp Contact:
- WhatsApp: +91 7593967016
- Direct Link: https://wa.me/917593967016

Office Location:
- Address: Peravoor, Kannur District, Kerala, India
- Google Maps: https://maps.google.com/?q=VMWJ%2BQ6+Peravoor,+Kerala
- Available Nationwide across India

=== ABOUT THE COMPANY ===
True Point Survey is a professional surveying and civil engineering services company based in Peravoor, Kannur, Kerala, India. We combine modern survey technology with practical site knowledge to give homeowners, architects, developers and contractors a dependable view of their land. Surveying is not just about coordinates — it is about removing uncertainty. We take the time to understand the brief, use the right tools for the job, and turn complex site information into work you can use.

=== SERVICES OFFERED ===
1. Land & Boundary Surveys:
   - Land surveys, boundary setting, and boundary refixing
   - Establishes exactly where property lines and boundaries stand
   - Boundary dispute resolution measurements
   - Property demarcation

2. Planning & CAD:
   - Plan drawing and CAD works
   - Plot design prepared with precision and practical intent
   - Site plans, layout plans, and subdivision plans

3. Building Setting Out:
   - Building setting out and site control
   - Translates architectural drawings into accurate construction on ground
   - Foundation marking and alignment

4. Levels & Terrain:
   - Levelling surveys
   - Contour surveys
   - Topographical surveys
   - Makes the character and elevation profile of a site clear

5. Quantity Calculations:
   - Reliable quantity calculations
   - Supports informed planning, costing, and project delivery
   - Earth work calculations
   - Material estimation support

=== OPERATING HOURS ===
- Available for consultations during standard business hours
- Contact via WhatsApp or phone for immediate response
- Site visits scheduled based on project requirements

=== SERVICE AREA ===
- Based in Peravoor, Kannur, Kerala
- Available nationwide across India
- Serving homeowners, architects, developers, and contractors
`;

const SYSTEM_PROMPT = `You are the official AI assistant for TRUE POINT SURVEY, a professional land surveying and civil engineering company based in Peravoor, Kannur, Kerala, India.

STRICT RULES:
1. You ONLY answer questions related to:
   - Land surveying (boundary surveys, topographic surveys, levelling)
   - Land boundary setting and refixing
   - Civil engineering topics (building setting out, site control, earthwork, quantity calculations)
   - Planning, CAD work, and plot design
   - TRUE POINT SURVEY company information (services, contact details, location)
   
2. For ANY question outside these topics, politely decline and say: "I'm specifically designed to help with survey, land boundary, and civil engineering questions only. For other queries, please contact us directly."

3. NEVER make up or hallucinate information. If you don't know something specific, say so and recommend contacting True Point Survey directly.

4. When users ask about contact, reaching us, phone numbers, email, location, or how to connect — provide the EXACT details from the company information below. DO NOT invent or modify any contact details.

5. Keep answers concise, professional, and helpful.

6. When appropriate, suggest contacting True Point Survey for detailed consultation.

7. Be conversational but professional. Use simple language that clients can understand.

COMPANY INFORMATION FOR REFERENCE:
${COMPANY_CONTEXT}

Remember: You represent True Point Survey. Be helpful, accurate, and professional. Never provide information you're not sure about.`;

// API endpoint — proxied through server (Vite proxy in dev, Vercel serverless in prod)
// API key is NEVER exposed to the browser

async function callGroqAPI(messagesForAPI) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'groq/compound-mini',
      messages: messagesForAPI,
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.9
    })
  });

  if (!response.ok) {
    let errMsg = `API error ${response.status}`;
    try {
      const errData = await response.json();
      if (errData.error) errMsg = errData.error;
    } catch (e) {
      // ignore parsing error
    }
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content
    || 'Sorry, I could not process your request. Please try again or contact us directly at +91 7593967016.';
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 I'm the True Point Survey assistant. I can help you with questions about land surveying, boundary setting, civil engineering, and our services. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Shared send logic used by both the input field and quick-topic buttons
  const handleSend = useCallback(async (userMessage) => {
    if (!userMessage?.trim() || isLoading) return;

    const text = userMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text }
      ];

      const reply = await callGroqAPI(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const isRateLimit = error.message && error.message.includes('rate limited');
      const errorContent = isRateLimit 
        ? error.message
        : 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment, or contact us directly:\n\n📞 +91 7593967016\n📧 truepoint571@gmail.com';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorContent
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const sendMessage = () => handleSend(input);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <>
      {/* Floating Chat Button with Bounce Animation */}
      <button
        className={`chatbot-fab ${isOpen ? 'chatbot-fab-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
        id="chatbot-toggle"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <img src="/assets/chatbot-icon.png" alt="Chat with us" className="chatbot-fab-icon" />
        )}
        {!isOpen && <span className="chatbot-fab-pulse" />}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'chatbot-window-open' : ''}`} id="chatbot-window">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar">
              <svg viewBox="0 0 46 46" aria-hidden="true">
                <path d="M4 35 23 6l19 29H4Zm9.5-5h19L23 15.5 13.5 30Z" />
                <path d="M23 15.5V41M9 30l14 11 14-11" />
              </svg>
            </div>
            <div>
              <strong>True Point AI</strong>
              <span className="chatbot-status">
                <span className="chatbot-status-dot" />
                Survey & Civil Eng. Assistant
              </span>
            </div>
          </div>
          <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" id="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chatbot-msg chatbot-msg-${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="chatbot-msg-avatar">
                  <svg viewBox="0 0 46 46" aria-hidden="true">
                    <path d="M4 35 23 6l19 29H4Zm9.5-5h19L23 15.5 13.5 30Z" />
                    <path d="M23 15.5V41M9 30l14 11 14-11" />
                  </svg>
                </div>
              )}
              <div className="chatbot-msg-bubble">
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chatbot-msg chatbot-msg-assistant">
              <div className="chatbot-msg-avatar">
                <svg viewBox="0 0 46 46" aria-hidden="true">
                  <path d="M4 35 23 6l19 29H4Zm9.5-5h19L23 15.5 13.5 30Z" />
                  <path d="M23 15.5V41M9 30l14 11 14-11" />
                </svg>
              </div>
              <div className="chatbot-msg-bubble chatbot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Topics */}
        {messages.length <= 1 && (
          <div className="chatbot-topics">
            {[
              '📏 What is boundary setting?',
              '📞 How to contact you?',
              '🗺️ What services do you offer?',
              '📐 Tell me about land surveying'
            ].map((topic, i) => (
              <button
                key={i}
                className="chatbot-topic-btn"
                onClick={() => handleSend(topic.replace(/^[^\s]+ /, ''))}
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area">
          <input
            ref={inputRef}
            type="text"
            className="chatbot-input"
            placeholder="Ask about surveys, boundaries, civil eng..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            id="chatbot-input"
          />
          <button
            className="chatbot-send"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            id="chatbot-send-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="chatbot-footer">
          Powered by True Point Survey AI · Survey & Civil Eng. only
        </div>
      </div>
    </>
  );
}
