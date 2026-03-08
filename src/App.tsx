/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { 
  Hammer, 
  ShieldCheck, 
  Droplets, 
  FileText, 
  MessageSquare, 
  Send, 
  X, 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  Database as DbIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';

// --- Constants & Types ---

const SYSTEM_INSTRUCTION = `Role:
You are the official AI Assistant for Fresh Your Walls Inc., a premier basement finishing and remodeling contractor based in Hamilton, Ontario. Your goal is to provide expert advice, answer project-related questions, and capture leads for free estimates.

Business Identity:
Company Name: Fresh Your Walls Inc.
Contact Person: Hashim Sohrab
Phone: (416) 915-5757
Email: Freshurwalls@gmail.com
Address: 168 Freedom Cres, Mount Hope, Ontario L0R 1W0
Service Area: Hamilton, Mount Hope, and surrounding regions (Ontario).
Specialization: Turnkey basement finishing, legal secondary suites, moisture management, and custom functional spaces (home offices, theaters, gyms).

Core Knowledge & Values:
Moisture First: Always emphasize that we use vapor barriers and sub-flooring to ensure a "fresh" and dry environment.
Code Compliance: We handle all Hamilton building permits and ensure projects meet the Ontario Building Code.
Professionalism: We provide detailed, itemized quotes and maintain a clean, efficient job site.

Communication Style:
Tone: Professional, energetic, and helpful.
Style: Use clear, non-technical language but mention professional terms like "LVP flooring," "Egress windows," and "Vapor barriers" to build authority.
Constraint: If asked about pricing, give the general range of $35–$75/sq. ft. but always encourage a "Free Inspection" for an accurate quote.

User Interaction Flow:
Acknowledge: Validate the user's vision for their basement.
Educate: Briefly explain a technical benefit (e.g., why we use mold-resistant materials).
Call to Action (CTA): End the conversation by asking if they would like to schedule a free estimate or if they have specific dimensions for their project.

Lead Capture:
When a user expresses interest in a free estimate or provides contact details, use the 'saveLead' tool to record their information. Ask for their name, email/phone, and project dimensions if they haven't provided them.`;

const saveLeadTool: FunctionDeclaration = {
  name: "saveLead",
  parameters: {
    type: Type.OBJECT,
    description: "Save a customer lead for a free estimate.",
    properties: {
      name: { type: Type.STRING, description: "Customer's full name" },
      email: { type: Type.STRING, description: "Customer's email address" },
      phone: { type: Type.STRING, description: "Customer's phone number" },
      dimensions: { type: Type.STRING, description: "Approximate dimensions of the basement (e.g., '800 sq ft')" },
      notes: { type: Type.STRING, description: "Any additional notes or project details" },
    },
    required: ["name"],
  },
};

interface Message {
  role: 'user' | 'model';
  text: string;
}

// --- Components ---

const Navbar = ({ onAdminClick }: { onAdminClick: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-brand-blue p-2 rounded-xl shadow-lg shadow-brand-blue/20">
          <Hammer className="text-brand-green w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-xl tracking-tight text-brand-blue leading-none">
            Fresh Your Walls
          </span>
          <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest mt-1">
            Basement Finishing Specialists
          </span>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#services" className="text-sm font-medium text-zinc-600 hover:text-brand-green transition-colors">Services</a>
        <a href="#faq" className="text-sm font-medium text-zinc-600 hover:text-brand-green transition-colors">FAQ</a>
        <button className="bg-brand-blue text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md shadow-brand-blue/10">
          Free Estimate
        </button>
      </div>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-32 pb-20 px-4">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
          <ShieldCheck className="w-4 h-4" />
          Hamilton's #1 Basement Specialist
        </div>
        <h1 className="font-display text-5xl lg:text-7xl font-bold text-zinc-900 leading-[1.1] mb-6">
          Expert Basement Finishing & Renovations
        </h1>
        <p className="text-lg text-zinc-600 mb-8 max-w-lg leading-relaxed">
          Transform your unused basement into a legal secondary suite, modern home office, or custom functional space. Moisture-proof, code-compliant, and built to last.
        </p>
        <div className="flex flex-wrap gap-4">
          <button className="bg-brand-blue text-white px-8 py-4 rounded-full font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-brand-blue/20">
            Get a Free Estimate <ArrowRight className="w-5 h-5" />
          </button>
          <button className="bg-white text-brand-blue border border-zinc-200 px-8 py-4 rounded-full font-bold hover:bg-zinc-50 transition-all">
            View Our Work
          </button>
        </div>
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <img 
            src="https://picsum.photos/seed/basement-modern/1200/900" 
            alt="Modern finished basement" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-zinc-100 hidden sm:block">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Droplets className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Priority</p>
              <p className="font-display font-bold text-zinc-900">Moisture-Proof Tech</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

const Services = () => {
  const services = [
    {
      title: "Legal Secondary Suites",
      desc: "Turn your basement into a rental unit that meets all Ontario Building Code and fire safety requirements.",
      icon: <FileText className="w-6 h-6" />
    },
    {
      title: "Custom Living Spaces",
      desc: "Home theaters, gyms, playrooms, or home offices tailored to your lifestyle and needs.",
      icon: <Hammer className="w-6 h-6" />
    },
    {
      title: "Moisture Management",
      desc: "Specialized sub-flooring and vapor barriers to ensure your space stays dry and fresh.",
      icon: <Droplets className="w-6 h-6" />
    }
  ];

  return (
    <section id="services" className="py-24 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-zinc-900 mb-4">Our Specializations</h2>
          <p className="text-zinc-600 max-w-2xl mx-auto">We don't just finish basements; we create high-quality, legal, and functional living environments.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100"
            >
              <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                {s.icon}
              </div>
              <h3 className="font-display text-xl font-bold text-zinc-900 mb-3">{s.title}</h3>
              <p className="text-zinc-600 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FAQ = () => {
  const faqs = [
    {
      q: "How much does it cost to finish a basement in Hamilton?",
      a: "The cost typically ranges between $35 and $75 per square foot, depending on materials and features like bathrooms or kitchens. Fresh Your Walls provides a fixed, itemized estimate to help you stay on budget."
    },
    {
      q: "Do I need a building permit to finish my basement in Ontario?",
      a: "Yes. A permit is required in Hamilton for structural changes, new plumbing, or creating a rental unit. We handle the permit application process to ensure your project passes all city inspections."
    },
    {
      q: "What is the difference between a finished and legal basement?",
      a: "A finished basement is for personal use, while a legal secondary suite must meet specific fire safety and ceiling height requirements to be legally rented."
    }
  ];

  return (
    <section id="faq" className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-4xl font-bold text-zinc-900 mb-12 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="font-bold text-zinc-900 mb-2 flex items-start gap-3">
                <span className="text-emerald-600">Q:</span> {faq.q}
              </h3>
              <p className="text-zinc-600 pl-7 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-zinc-900 text-white py-16 px-4">
    <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div className="col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-emerald-600 p-2 rounded-lg">
            <Hammer className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            Fresh Your Walls
          </span>
        </div>
        <p className="text-zinc-400 max-w-md mb-8">
          Premier basement finishing and remodeling contractor serving Hamilton and surrounding regions. We specialize in moisture-proof, code-compliant functional spaces.
        </p>
        <div className="flex gap-4">
          <div className="bg-zinc-800 p-3 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer">
            <Phone className="w-5 h-5" />
          </div>
          <div className="bg-zinc-800 p-3 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer">
            <Mail className="w-5 h-5" />
          </div>
          <div className="bg-zinc-800 p-3 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-6">Services</h4>
        <ul className="space-y-4 text-zinc-400 text-sm">
          <li>Legal Basement Suites</li>
          <li>Basement Remodeling</li>
          <li>Moisture Protection</li>
          <li>Home Offices & Gyms</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6">Company</h4>
        <ul className="space-y-4 text-zinc-400 text-sm">
          <li>About Us</li>
          <li>Our Process</li>
          <li>Free Estimate</li>
          <li>Hamilton, ON</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs">
      &copy; {new Date().getFullYear()} Fresh Your Walls. All rights reserved.
    </div>
  </footer>
);

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm the Fresh Your Walls assistant. How can I help you with your basement project today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: [saveLeadTool] }],
        },
      });

      let response = await chat.sendMessage({ message: userMessage });
      
      // Handle function calls
      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'saveLead') {
            try {
              const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(call.args),
              });
              const data = await res.json();
              
              // Send tool response back to model
              response = await chat.sendMessage({
                message: `Lead saved successfully with ID: ${data.id}. Please confirm to the user that their request for a free estimate has been recorded and a specialist will contact them soon.`
              });
            } catch (err) {
              console.error("Failed to save lead:", err);
              response = await chat.sendMessage({
                message: "There was an error saving the lead. Please apologize to the user and ask them to try again or call us directly."
              });
            }
          }
        }
      }

      const modelText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: 'model', text: modelText }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having some trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:bg-emerald-700 transition-all z-40 group"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-4 bg-zinc-900 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Questions? Ask our AI
        </span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[90vw] sm:w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden border border-zinc-100"
          >
            {/* Header */}
            <div className="bg-brand-blue p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Hammer className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h3 className="font-bold leading-none mb-1">Fresh Your Walls</h3>
                  <p className="text-[10px] text-brand-green uppercase tracking-widest font-bold">Basement Finishing Specialists</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-zinc-800 shadow-sm border border-zinc-100 rounded-tl-none'
                  }`}>
                    <div className="markdown-body">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-zinc-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-zinc-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-zinc-100">
              <div className="relative flex items-center">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about permits, pricing, or suites..."
                  className="w-full bg-zinc-100 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-center text-zinc-400 mt-3 font-medium">
                AI Assistant for Fresh Your Walls &bull; Hamilton, ON
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const LeadsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/leads')
        .then(res => res.json())
        .then(data => {
          setLeads(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
              <div className="flex items-center gap-3">
                <DbIcon className="text-emerald-600 w-6 h-6" />
                <h2 className="font-display text-2xl font-bold">Captured Leads</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  No leads captured yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-xs uppercase tracking-widest text-zinc-400 font-bold">
                        <th className="pb-4 px-4">Date</th>
                        <th className="pb-4 px-4">Name</th>
                        <th className="pb-4 px-4">Contact</th>
                        <th className="pb-4 px-4">Dimensions</th>
                        <th className="pb-4 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {leads.map((lead, i) => (
                        <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                          <td className="py-4 px-4 text-zinc-500 whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 font-bold text-zinc-900">{lead.name}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              {lead.email && <span className="text-zinc-600">{lead.email}</span>}
                              {lead.phone && <span className="text-zinc-400 text-xs">{lead.phone}</span>}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-zinc-600">{lead.dimensions || '-'}</td>
                          <td className="py-4 px-4 text-zinc-500 max-w-xs truncate">{lead.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [isLeadsOpen, setIsLeadsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar onAdminClick={() => setIsLeadsOpen(true)} />
      <main>
        <Hero />
        
        {/* Trust Bar */}
        <div className="bg-zinc-900 py-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale invert">
            <div className="flex items-center gap-2 font-bold text-lg"><CheckCircle2 className="w-5 h-5" /> Licensed</div>
            <div className="flex items-center gap-2 font-bold text-lg"><ShieldCheck className="w-5 h-5" /> Insured</div>
            <div className="flex items-center gap-2 font-bold text-lg"><Clock className="w-5 h-5" /> 4-8 Week Completion</div>
            <div className="flex items-center gap-2 font-bold text-lg"><FileText className="w-5 h-5" /> OBC Compliant</div>
          </div>
        </div>

        <Services />

        {/* Features Section */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                <img 
                  src="https://picsum.photos/seed/construction-detail/1000/1000" 
                  alt="Construction detail" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-display text-4xl font-bold mb-8">Why Hamilton Homeowners Choose Us</h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-xl h-fit">
                    <Droplets className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Moisture First Approach</h4>
                    <p className="text-zinc-600">We prioritize vapor barriers and specialized sub-flooring to ensure your basement stays dry, fresh, and mold-free for decades.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-xl h-fit">
                    <ShieldCheck className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Full Permit Handling</h4>
                    <p className="text-zinc-600">Don't worry about the paperwork. We handle all Hamilton building permits and ensure every project passes city inspections.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-emerald-100 p-3 rounded-xl h-fit">
                    <FileText className="text-emerald-600 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Itemized Fixed Quotes</h4>
                    <p className="text-zinc-600">No hidden fees. You receive a detailed, itemized breakdown of costs so you know exactly where your investment is going.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQ />

        {/* CTA Section */}
        <section className="py-24 px-4">
          <div className="max-w-5xl mx-auto bg-emerald-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">Ready to Fresh Your Walls?</h2>
              <p className="text-emerald-50 text-lg mb-10 max-w-2xl mx-auto">
                Schedule your free, no-obligation inspection and estimate today. Let's turn your basement vision into a reality.
              </p>
              <button className="bg-white text-emerald-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl">
                Book Free Estimate
              </button>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          </div>
        </section>
      </main>
      
      <footer className="bg-zinc-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-blue p-2 rounded-xl">
                <Hammer className="text-brand-green w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl tracking-tight">
                  Fresh Your Walls Inc.
                </span>
                <span className="text-[8px] font-bold text-brand-green uppercase tracking-[0.2em]">
                  Basement Finishing Specialists
                </span>
              </div>
            </div>
            <p className="text-zinc-400 max-w-md mb-8">
              Premier basement finishing and remodeling contractor serving Hamilton, Mount Hope, and surrounding regions. We specialize in moisture-proof, code-compliant functional spaces.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-zinc-400 hover:text-brand-green transition-colors">
                <div className="bg-zinc-800 p-3 rounded-full">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Call Us</p>
                  <p className="font-medium">(416) 915-5757</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-400 hover:text-brand-green transition-colors">
                <div className="bg-zinc-800 p-3 rounded-full">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Us</p>
                  <p className="font-medium">Freshurwalls@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-400 hover:text-brand-green transition-colors">
                <div className="bg-zinc-800 p-3 rounded-full">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Visit Us</p>
                  <p className="font-medium">168 Freedom Cres, Mount Hope, ON L0R 1W0</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <div className="bg-zinc-800 p-3 rounded-full">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Attention</p>
                  <p className="font-medium">Hashim Sohrab</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li>Legal Basement Suites</li>
              <li>Basement Remodeling</li>
              <li>Moisture Protection</li>
              <li>Home Offices & Gyms</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-zinc-400 text-sm">
              <li>About Us</li>
              <li>Our Process</li>
              <li>Free Estimate</li>
              <li className="cursor-pointer hover:text-emerald-500 transition-colors" onClick={() => setIsLeadsOpen(true)}>Admin Dashboard</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs">
          &copy; {new Date().getFullYear()} Fresh Your Walls. All rights reserved.
        </div>
      </footer>

      <ChatAssistant />
      <LeadsModal isOpen={isLeadsOpen} onClose={() => setIsLeadsOpen(false)} />
    </div>
  );
}
