import * as React from 'react';
import { OpenAI } from 'openai';

import './index.css';

// OpenApi
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

function App() {
  const [message, setMessage] = React.useState('');
  const [chats, setChats] = React.useState([]);
  const [isTyping, setIsTyping] = React.useState(false);

  const chatsRef = React.useRef(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      chatsRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      chatsRef.current?.scrollTo(0, 1e10);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isTyping]);

  const chat = async (e, message) => {
    e.preventDefault();

    if (!message) return;

    setIsTyping(true);

    let messages = chats;
    messages.push({ role: 'user', content: message });
    // update chats with user input
    setChats(messages);
    setMessage('');

    await openai.chat.completions
      .create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: 'You are SupermarketCustomerGPT. You help with insights into customers shopping habits and campaign interactions.' }, ...chats],
      })
      .then((result) => {
        messages.push(result.choices[0].message);
        // update chats with bot response
        setChats(messages);
        setIsTyping(false);
      })
      .catch((error) => console.log(error));
  };

  return (
    <main className="flex flex-1 flex-col justify-items-stretch h-full w-full">
      {/* <h1 className='text-3xl font-bold underline text-center'>React ChatGPT App</h1> */}
      <h1 className="mb-4">React ChatGPT App</h1>
      <section
        className="flex flex-col flex-1 border box-border rounded-xl w-full px-4 pt-4 overflow-y-auto"
        ref={chatsRef}
      >
        {chats && chats.length
          ? chats.map((chat, index) => (
            <p
              key={index}
              className={`flex flex-shrink mb-4 rounded-xl p-3 ${chat.role === 'user' ? 'flex-row-reverse text-right bg-gray-300' : 'flex-row bg-gray-600 text-white'
                }`}
            >
              <span>{chat.role}</span>
              <span>: </span>
              <span>{chat.content}</span>
            </p>
          ))
          : null}
        {isTyping ? (
          <div>
            <p className='mb-3'>
              <i>Typing...</i>
            </p>
          </div>
        ) : null}
      </section>

      <form onSubmit={(e) => chat(e, message)}>
        <input
          className="w-full p-2 mt-2 bg-slate-100 border border-cyan-950 rounded-xl"
          name="message"
          value={message}
          placeholder="Type a message and hit enter"
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </main>
  );
}

export default App;
