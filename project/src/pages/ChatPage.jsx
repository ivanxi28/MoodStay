import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

function ChatPage() {
  const { chatId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [chatDetails, setChatDetails] = useState(null);
  const messagesEndRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL;

  // Function to scroll to the bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch messages from the API
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !chatId) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      try {
        // First, get chat details to know which entity ID to use
        const chatDetailsRes = await fetch(`${API_URL}/chats/${chatId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!chatDetailsRes.ok) {
          throw new Error('Failed to fetch chat details');
        }

        const chatData = await chatDetailsRes.json();
        setChatDetails(chatData);

        // Prepare payload for messages request
        const payload = {
          customerId: user.id
        };

        // Add the appropriate entity ID based on chat details
        if (chatData.accommodationId) {
          payload.accommodationId = chatData.accommodationId;
        } else if (chatData.restaurantId) {
          payload.restaurantId = chatData.restaurantId;
        } else if (chatData.experienceId) {
          payload.experienceId = chatData.experienceId;
        } else {
          throw new Error('Chat is not associated with any entity');
        }

        // Fetch messages with the constructed payload
        const messagesRes = await fetch(`${API_URL}/chats/owner/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!messagesRes.ok) {
          throw new Error('Failed to fetch messages');
        }

        const messagesData = await messagesRes.json();
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('No se pudo cargar el chat. Inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up polling to refresh messages every 10 seconds
    const intervalId = setInterval(fetchMessages, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [chatId, user, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !chatDetails) return;

    setSending(true);
    setError(null);
    const token = localStorage.getItem('token');

    try {
      // Prepare the message payload
      const payload = {
        chatId: chatId,
        content: newMessage,
        senderId: user.id
      };

      const response = await fetch(`${API_URL}/chats/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(errorData.message || 'Failed to send message');
      }

      const sentMessage = await response.json();

      // Add the new message to the state
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessage(''); // Clear input field
    } catch (err) {
      console.error('Error sending message:', err);
      setError('No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  // Determine the other party's name
  const getRecipientName = () => {
    if (!chatDetails) return 'Chat';
    
    if (chatDetails.accommodation) {
      return `Chat con ${chatDetails.accommodation.host?.firstName || 'Anfitrión'}`;
    } else if (chatDetails.restaurant) {
      return `Chat con ${chatDetails.restaurant.name || 'Restaurante'}`;
    } else if (chatDetails.experience) {
      return `Chat con ${chatDetails.experience.name || 'Experiencia'}`;
    }
    
    return 'Chat';
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center shadow-md sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="mr-4 hover:bg-blue-700 p-1 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold">{getRecipientName()}</h1>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && <p className="text-center text-gray-500">Cargando mensajes...</p>}
        {error && <p className="text-center text-red-500 bg-red-100 p-2 rounded">{error}</p>}
        {!loading && messages.length === 0 && !error && (
          <p className="text-center text-gray-500">No hay mensajes. Inicia la conversación.</p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                msg.senderId === user.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border'
              }`}
            >
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-blue-100' : 'text-gray-400'} text-right`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending || loading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 disabled:opacity-50"
            disabled={!newMessage.trim() || sending || loading}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPage;