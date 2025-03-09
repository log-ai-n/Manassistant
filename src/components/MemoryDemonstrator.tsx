import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { getRecentMemories, Memory } from '../services/memoryService';
import { processConversationForMemories, getRelevantMemories } from '../lib/agent-system/memory-processor';
import { generateChatCompletion, enhanceResponseWithMemories } from '../lib/deepseek-client';
import { DEEPSEEK_API_KEY, DEEPSEEK_MODEL } from '../lib/environment';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const MemoryDemonstrator: React.FC = () => {
  const { currentRestaurant } = useRestaurant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [relevantMemories, setRelevantMemories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingMemory, setProcessingMemory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: 'user' | 'assistant', content: string}[]>([]);

  useEffect(() => {
    if (!currentRestaurant?.id) return;
    
    const loadMemories = async () => {
      const recentMemories = await getRecentMemories(currentRestaurant.id, 5);
      setMemories(recentMemories);
    };
    
    loadMemories();
  }, [currentRestaurant]);

  const generateAssistantResponse = async (userMessage: string): Promise<string> => {
    try {
      // Build conversation history for context
      const chatHistory = [
        {
          role: 'system' as const,
          content: `You are an AI assistant for ${currentRestaurant?.name || 'our restaurant'}. 
          Be friendly, helpful, and conversational. Provide specific information when asked about menu items, 
          hours, or services. Keep responses brief and focused on helping the customer.`
        },
        // Add last 5 messages from history for context
        ...conversationHistory.slice(-5)
      ];
      
      // Generate base response from DeepSeek
      const baseResponse = await generateChatCompletion({
        messages: [...chatHistory, { role: 'user', content: userMessage }]
      });
      
      // If we have relevant memories, enhance the response
      if (relevantMemories.length > 0) {
        return await enhanceResponseWithMemories(baseResponse, relevantMemories);
      }
      
      return baseResponse;
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback responses if API fails
      if (userMessage.toLowerCase().includes('allergy') || userMessage.toLowerCase().includes('allergic')) {
        return `I've noted your allergy information. We'll make sure the kitchen is informed about this whenever you visit.`;
      }
      
      if (userMessage.toLowerCase().includes('birthday') || userMessage.toLowerCase().includes('anniversary')) {
        return `Thank you for sharing about your special day! We'll make sure to help you celebrate when the time comes.`;
      }
      
      return `Thanks for your message. I'm having some trouble connecting right now, but I'll be sure to help you when I'm back online.`;
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !currentRestaurant?.id) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Update conversation history
    setConversationHistory(prev => [...prev, { role: 'user', content: inputMessage }]);
    
    setInputMessage('');
    setLoading(true);
    
    // Process for getting relevant memories
    const memories = await getRelevantMemories(
      currentRestaurant.id,
      inputMessage,
      'conversation'
    );
    setRelevantMemories(memories);
    
    // Generate response
    const response = await generateAssistantResponse(inputMessage);
    
    // Add assistant message
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Update conversation history with assistant response
    setConversationHistory(prev => [...prev, { role: 'assistant', content: response }]);
    
    setLoading(false);
    
    // Process for new memories (in background)
    setProcessingMemory(true);
    processConversationForMemories({
      restaurantId: currentRestaurant.id,
      userMessage: inputMessage
    }).then(async () => {
      // Refresh memories list
      const recentMemories = await getRecentMemories(currentRestaurant.id, 5);
      setMemories(recentMemories);
      setProcessingMemory(false);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mx-auto max-w-4xl">
      <h2 className="text-xl font-bold mb-4">AI Memory System Demo</h2>
      <p className="text-sm text-gray-500 mb-6">
        This demonstrates how the AI remembers important details from conversations using DeepSeek.
        Try mentioning allergies, preferences, or special occasions in your messages.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 mt-32">Start a conversation to see AI memories in action</p>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div 
                    key={message.id}
                    className={`p-3 rounded-lg max-w-[80%] ${
                      message.role === 'user' 
                        ? 'bg-blue-100 ml-auto' 
                        : 'bg-gray-200'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {loading && (
                  <div className="p-3 rounded-lg bg-gray-200 max-w-[80%] animate-pulse">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmitMessage} className="flex">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message (try mentioning preferences or allergies)"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
        
        <div>
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2 flex items-center justify-between">
              <span>Restaurant Memories</span>
              {processingMemory && (
                <span className="inline-block h-4 w-4 rounded-full border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></span>
              )}
            </h3>
            
            {memories.length === 0 ? (
              <p className="text-sm text-gray-500">No memories stored yet.</p>
            ) : (
              <div className="space-y-3">
                {memories.map(memory => (
                  <div key={memory.id} className="border-b pb-2">
                    <p className="text-sm">{memory.memory_content}</p>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(memory.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Importance: {memory.importance}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {relevantMemories.length > 0 && (
            <div className="border rounded-lg p-4 mt-4 bg-yellow-50">
              <h3 className="font-medium mb-2">Memories Used in Response</h3>
              <ul className="list-disc list-inside space-y-1">
                {relevantMemories.map((memory, idx) => (
                  <li key={idx} className="text-sm">{memory}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="border rounded-lg p-4 mt-4 bg-blue-50">
            <h3 className="font-medium mb-2">DeepSeek Status</h3>
            <p className="text-sm text-gray-700">
              Using model: {DEEPSEEK_MODEL()}
            </p>
            <p className="text-sm text-gray-700">
              API Status: {DEEPSEEK_API_KEY() ? 'Connected' : 'Not Connected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryDemonstrator; 