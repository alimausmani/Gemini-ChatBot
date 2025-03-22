import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_KEY = import.meta.env.VITE_API_KEY;
const API_URL = `${import.meta.env.VITE_API_URL}?key=${API_KEY}`;

const ChatBot = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isBotTyping, setIsBotTyping] = useState(false);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsBotTyping(true);

        try {
            const response = await axios.post(
                API_URL,{contents: [{parts: [{text: input,},],},],}
            );

            const botResponse = response.data.candidates[0].content.parts[0].text;
            const botMessageLines = botResponse.split('\n');

            for (let i = 0; i < botMessageLines.length; i++) {
                const line = botMessageLines[i];

                const messageId = Date.now() + i; 
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { id: messageId, text: '', sender: 'bot' },
                ]);


                for (let j = 0; j < line.length; j++) {
                    await new Promise((resolve) => setTimeout(resolve, 50)); 
                    setMessages((prevMessages) =>prevMessages.map((msg) =>msg.id === messageId? { ...msg, text: msg.text + line[j] }: msg)
                    );
                }

                await new Promise((resolve) => setTimeout(resolve, 300));
            }
        } catch (error) {
            console.error('Error sending message to Gemini API:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { text: 'Sorry, something went wrong. Please try again.', sender: 'bot' },
            ]);
        } finally {
            setIsBotTyping(false); 
        }
    };


    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !isBotTyping) {
            handleSendMessage();
        }
    };

    return (
        <div className="App">
            <div className="chat-title">Gemini ChatBot</div>  
            <div className="chat-container">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`} >
                        {message.text}
                    </div>
                ))}
                {isBotTyping && (
                    <div className="message bot-message">
                        <span className="typing-indicator">Typing...</span>
                    </div>
                )}
            </div>
            <div className="input-container">
                <input type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyPress} placeholder="Type a message..." disabled={isBotTyping} />
                <button onClick={handleSendMessage} disabled={isBotTyping}>Send</button>
            </div>
        </div>
    );
};

export default ChatBot;





