import  { useState } from 'react';
import axios from 'axios';

const HRAssistantView = () => {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const newChatHistory = [...chatHistory, { sender: 'user', text: message }];
        setChatHistory(newChatHistory);
        setMessage('');
        setIsLoading(true);

        try {
            // const res = await axios.post('http://localhost:3000/api/auth/chat', { message });
            const storedUser = JSON.parse(localStorage.getItem('user'));
            const res = await axios.post('http://localhost:3000/api/auth/chat', {
                message,
                employee_id: storedUser?.id || ""
            });
            
            setChatHistory([...newChatHistory, { sender: 'bot', text: res.data.response }]);
        } catch (error) {
            console.error("Failed to fetch response:", error);
            setChatHistory([...newChatHistory, { sender: 'bot', text: "Error: Could not connect to server." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-250 my-12 mx-auto p-5 border border-zinc-200 rounded-lg shadow-sm bg-zinc-900/50">
    <h3 className="text-xl font-bold text-zinc-100 ">HRBot AI</h3>
    <p className='font-medium text-zinc-400 mb-4'>Dev Guard Hr Assistant:Always online</p>
    
    <div className="h-130 w-200 overflow-y-auto border border-zinc-800 rounded-md p-2.5 mb-2.5 space-y-2">
        {chatHistory.map((chat, index) => (
            <div 
                key={index} 
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
                <span 
                    className={`inline-block px-2.5 py-1.5 rounded-2xl text-sm max-w-[75%] text-white ${
                        chat.sender === 'user' 
                            ? 'bg-blue-600 rounded-br-none' 
                            : 'bg-emerald-600 rounded-bl-none'
                    }`}
                >
                    {chat.text}
                </span>
            </div>
        ))}
        {isLoading && <p className="text-sm text-zinc-500 animate-pulse">Bot is typing...</p>}
    </div>

    <form onSubmit={handleSendMessage} className="flex gap-2">
        <input 
            type="text" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Type your message..." 
            className="flex-grow:1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
        />
        <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-lg transition-colors shadow-md"
        >
            Send
        </button>
    </form>
</div>
    );
};

export default HRAssistantView;