import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Pill,
  MapPin,
  ChevronDown,
} from 'lucide-react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const Chatbot = ({ onMedicineSearch, initialQuery = null, isOpenExternal = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(isOpenExternal);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: "Hi! 👋 I'm MedAssist AI, your comprehensive health assistant. Ask me about any medicine, symptoms, health tips, diet, skincare, haircare, or medical treatments. I'm here to help!",
      timestamp: new Date(),
    },
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

  // Handle external open/close
  useEffect(() => {
    setIsOpen(isOpenExternal);
  }, [isOpenExternal]);

  // Handle initial query (when clicking on a saved medicine)
  useEffect(() => {
    if (initialQuery && isOpen) {
      // Auto-send the initial query about the medicine
      const autoQuery = `Tell me everything about ${initialQuery} medicine - what it's used for, dosage, side effects, precautions, and alternatives.`;
      setInput('');
      handleAutoSend(autoQuery);
    }
  }, [initialQuery, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const generateGeminiResponse = async (userMessage) => {
    const systemPrompt = `You are MedAssist AI, a comprehensive health and medicine assistant for the MediFind Emergency Medicine Locator app. 

YOUR CAPABILITIES:
1. **Medicines & Drugs**: Explain uses, dosages, side effects, interactions, alternatives for ALL medicines - from common painkillers to specialized medications
2. **Symptoms & Conditions**: Help identify what medicine might be needed for various symptoms
3. **Diet & Nutrition**: Provide dietary advice for health conditions, weight management, and general wellness
4. **Skincare**: Advise on skincare routines, acne treatments, serums, moisturizers, and dermatological products
5. **Haircare**: Help with hair loss treatments (like Minoxidil), hair growth serums, dandruff solutions
6. **Supplements & Vitamins**: Explain benefits, dosages, and when to take supplements
7. **Medical Procedures**: Provide basic information about surgeries, treatments, and recovery
8. **Health Tips**: Offer preventive health advice and lifestyle recommendations

RESPONSE STYLE:
- Be CONCISE and TO THE POINT - no unnecessary fluff
- Use bullet points for clarity
- Highlight important warnings in bold
- Keep responses under 150 words unless detailed info is requested
- Use simple terms anyone can understand
- Always include a brief disclaimer when appropriate

FORMAT MEDICINE NAMES:
- Always write medicine names in **bold** format like **Paracetamol**

IMPORTANT:
- For serious symptoms, always recommend consulting a doctor
- Never diagnose conditions - only provide information
- Mention common brand names when relevant for India market`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm sorry, I couldn't process that. Please try again."
      );
    } catch (error) {
      console.error('Gemini API error:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  };

  const extractMedicineName = (text) => {
    // Common medicine patterns
    const boldPattern = /\*\*([^*]+)\*\*/g;
    const matches = [...text.matchAll(boldPattern)];
    return matches.map((m) => m[1]);
  };

  const handleAutoSend = async (query) => {
    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      text: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Get Gemini response
    const botResponse = await generateGeminiResponse(query);

    // Extract medicine names for quick search buttons
    const medicines = extractMedicineName(botResponse);

    const newBotMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: botResponse,
      timestamp: new Date(),
      medicines: medicines.length > 0 ? medicines : null,
    };
    setMessages((prev) => [...prev, newBotMessage]);
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      text: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    // Get Gemini response
    const botResponse = await generateGeminiResponse(userMessage);

    // Extract medicine names for quick search buttons
    const medicines = extractMedicineName(botResponse);

    const newBotMessage = {
      id: Date.now() + 1,
      type: 'bot',
      text: botResponse,
      timestamp: new Date(),
      medicines: medicines.length > 0 ? medicines : null,
    };
    setMessages((prev) => [...prev, newBotMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMedicineClick = (medicine) => {
    if (onMedicineSearch) {
      onMedicineSearch(medicine);
      handleClose();
    }
  };

  const formatMessage = (text) => {
    // Convert **text** to bold
    return text.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-primary-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Button - Always visible */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 shadow-2xl flex items-center justify-center group"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MessageCircle size={28} className="text-white" />
            </motion.div>
            
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-30" />
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-full mr-3 px-3 py-2 bg-slate-800 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Sparkles size={14} className="inline mr-1 text-yellow-400" />
              Health Assistant
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[600px] max-h-[80vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-primary-500/20 to-purple-600/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center"
                  >
                    <Bot size={20} className="text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-semibold text-white">MedAssist AI</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-white/60">Online • Ask anything!</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-white/70" />
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                        : 'bg-white/10 text-white rounded-2xl rounded-bl-md'
                    } px-4 py-3`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.type === 'bot' && (
                        <Bot size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {formatMessage(msg.text)}
                        </p>
                        
                        {/* Medicine quick search buttons */}
                        {msg.medicines && msg.medicines.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.medicines.slice(0, 3).map((med, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleMedicineClick(med)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/30 hover:bg-primary-500/50 text-xs font-medium transition-colors"
                              >
                                <Pill size={12} />
                                Search "{med}"
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                      {msg.type === 'user' && (
                        <User size={16} className="text-white/70 mt-0.5 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] opacity-50 mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Bot size={16} className="text-primary-400" />
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [0, -5, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                            className="w-2 h-2 rounded-full bg-primary-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-white/5">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['Diet for diabetes', 'Hairfall remedies', 'Acne treatment', 'Immunity tips'].map(
                  (suggestion, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs text-white/70 transition-colors"
                    >
                      {suggestion}
                    </motion.button>
                  )
                )}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about medicines..."
                  className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
