import React, { useState, useEffect, useRef } from "react";
import {
  FaPaperPlane,
  FaMicrophone,
  FaMoon,
  FaSun,
  FaBars,
  FaUser,
  FaPlus,
  FaEdit,
  FaTrash,
 
  FaCopy
} from "react-icons/fa";
import "./App.css";
import logor from "./assets/logor.png";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; // Choose your theme!


function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previousChats, setPreviousChats] = useState(
    JSON.parse(localStorage.getItem("chats")) || []
  );
  const [currentChatIndex, setCurrentChatIndex] = useState(null);
  const [chatNames, setChatNames] = useState(
    JSON.parse(localStorage.getItem("chatNames")) ||
      previousChats.map((_, index) => `Chat ${index + 1}`)
  );
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(previousChats));
    localStorage.setItem("chatNames", JSON.stringify(chatNames));
  }, [previousChats, chatNames]);

  const startNewChat = () => {
    setShowWelcome(true);
    const newChatIndex = previousChats.length;
    setPreviousChats([...previousChats, []]);
    setChatNames([...chatNames, `Chat ${newChatIndex + 1}`]);
    setCurrentChatIndex(newChatIndex);
    setChat([]);
  };

  const loadChat = (index) => {
    setShowWelcome(false);
    setCurrentChatIndex(index);
    setChat(previousChats[index]);
  };

  const renameChat = (index) => {
    const newName = prompt("Enter new chat name:", chatNames[index]);
    if (newName) {
      const updatedNames = [...chatNames];
      updatedNames[index] = newName;
      setChatNames(updatedNames);
    }
  };

  const deleteChat = (index) => {
    if (window.confirm(`Are you sure you want to delete "${chatNames[index]}"?`)) {
      const updatedChats = previousChats.filter((_, i) => i !== index);
      const updatedNames = chatNames.filter((_, i) => i !== index);
      setPreviousChats(updatedChats);
      setChatNames(updatedNames);
      setChat([]);
      setCurrentChatIndex(null);
    }
  };

  // const sendMessage = async () => {
  //   if (!message.trim()) return;
  //   if (showWelcome) setShowWelcome(false);
  
  //   const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  //   const newMessage = { text: message, sender: "user", time };
  //   setChat((prevChat) => [...prevChat, newMessage]);
  
  //   if (currentChatIndex !== null && chat.length === 0) {
  //     const firstWords = message.split(" ").slice(0, 3).join(" ");
  //     const updatedNames = [...chatNames];
  //     updatedNames[currentChatIndex] = firstWords || `Chat ${currentChatIndex + 1}`;
  //     setChatNames(updatedNames);
  //   }
  
  //   setMessage("");
  
  //   try {
  //     const res = await fetch("http://localhost:5000/chat", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ message, user_id: "user123" }),
  //     });
  
  //     if (!res.ok) {
  //       throw new Error("Failed to fetch response from server");
  //     }
  
  //     const reader = res.body.getReader();
  //     let botResponse = "";
  //     let insideThink = false; // Track if we are inside <think> tags
  
  //     const processStream = async () => {
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) break;
  
  //         const text = new TextDecoder().decode(value).trim();
  //         if (!text) continue;
  
  //         text.split("\n").forEach((line) => {
  //           try {
  //             const jsonChunk = JSON.parse(line);
  //             let chunkText = jsonChunk.response || "";
              
  //             // 🚀 **Filter out <think> and its content**
  //             if (chunkText.includes("<think>")) {
  //               insideThink = true;
  //               return; // Ignore this chunk
  //             }
  //             if (insideThink) {
  //               if (chunkText.includes("</think>")) {
  //                 insideThink = false;
  //               }
  //               return; // Skip until </think> is found
  //             }
  
  //             // Append valid bot response text
  //             botResponse += chunkText + " ";
  
  //             // Update chat UI live
  //             setChat((prevChat) => [...prevChat.slice(0, -1), { text: botResponse.trim(), sender: "bot", time }]);
  
  //           } catch (err) {
  //             console.warn("Skipping invalid JSON chunk:", line);
  //           }
  //         });
  //       }
  //     };
  
  //     // Show "Thinking..." message while waiting for response
  //     setChat((prevChat) => [...prevChat, { text: "Thinking...", sender: "bot", time }]);
  
  //     await processStream();
  
  //     // ✅ Save conversation in history correctly
  //     setPreviousChats((prev) => {
  //       const updatedChats = [...prev];
  //       updatedChats[currentChatIndex] = [...chat, { text: botResponse.trim(), sender: "bot", time }];
  //       return updatedChats;
  //     });

  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (showWelcome) setShowWelcome(false);
  
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMessage = { text: message, sender: "user", time };
  
    setChat((prevChat) => [...prevChat, newMessage]);
  
    if (currentChatIndex !== null && chat.length === 0) {
      const firstWords = message.split(" ").slice(0, 3).join(" ");
      const updatedNames = [...chatNames];
      updatedNames[currentChatIndex] = firstWords || `Chat ${currentChatIndex + 1}`;
      setChatNames(updatedNames);
    }
  
    setMessage("");
  
    try {
      // Show "Thinking..." message while waiting for response
      const botPlaceholder = { text: "Thinking...", sender: "bot", time };
      setChat((prevChat) => [...prevChat, botPlaceholder]);
  
      const response = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, user_id: "user123" }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch response from server");
      }
  
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botResponse = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
  
        // Split by "data: " prefix used in SSE
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
  
            if (dataStr === "[DONE]") {
              // Complete message received
              setPreviousChats((prev) => {
                const updatedChats = [...prev];
                updatedChats[currentChatIndex] = [...chat, { text: botResponse.trim(), sender: "bot", time }];
                return updatedChats;
              });
              return;
            }
  
            try {
              const json = JSON.parse(dataStr);
              let chunkText = json.response || "";
  
              // Filter out <think> tags if needed (optional)
              if (chunkText.includes("<think>")) return;
              if (chunkText.includes("</think>")) return;
  
              botResponse += chunkText;
  
              // Update chat UI live
              setChat((prevChat) => [
                ...prevChat.slice(0, -1),
                { text: botResponse.trim(), sender: "bot", time },
              ]);
            } catch (err) {
              console.warn("Failed to parse SSE line:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setChat((prevChat) => [
        ...prevChat.slice(0, -1),
        { text: "Error retrieving response.", sender: "bot", time },
      ]);
    }
  };


  const handlePromptClick = (promptType) => {
    setShowWelcome(false);
    setCurrentPrompt(promptType);
  
    if (promptType === "smartContract") {
      // Add a message to chat history prompting user for input
      setChat((prevChat) => [
        ...prevChat,
        {
          sender: "bot",
          text: "Please provide specifications for your smart contract (e.g., mint, burn, pause).",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  
    if (promptType === "nft") {
      setChat((prevChat) => [
        ...prevChat,
        {
          sender: "bot",
          text: "Please provide details about the NFT collection you want to create (e.g., name, symbol, max supply).",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  
    if (promptType === "token") {
      setChat((prevChat) => [
        ...prevChat,
        {
          sender: "bot",
          text: "Please provide details for your token (e.g., name, symbol, total supply).",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  
    if (promptType === "audit") {
      setChat((prevChat) => [
        ...prevChat,
        {
          sender: "bot",
          text: "Please paste the smart contract code you want to audit.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };
  
  

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
  


  const editMessage = (msg) => {
    setMessage(msg.text); // Set input field to message text
  };
  
  const copyMessage = (msg) => {
    navigator.clipboard.writeText(msg.text);
    alert("Message copied!");
  };
  const parseMessage = (text) => {
    const parts = [];
    const regex = /```(.*?)```/gs;
    let lastIndex = 0;
    let match;
  
    while ((match = regex.exec(text)) !== null) {
      // Push the text before the code block
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index).trim(),
        });
      }
  
      // Push the code block content
      parts.push({
        type: "code",
        content: match[1].replace(/^solidity\n/, "").trim(), // Remove 'solidity' if present
      });
  
      lastIndex = regex.lastIndex;
    }
  
    // Push any remaining text after the last code block
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex).trim(),
      });
    }
  
    return parts.filter(part => part.content !== ""); // Remove empty strings
  };
  
  

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      {sidebarOpen && (
        <div className="sidebar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(false)}>
            <FaBars />
          </button>
          <button className="new-chat-button" onClick={startNewChat}>
            <FaPlus />
          </button>
          <h2>Previous Chats</h2>
          <ul>
            {previousChats.map((_, index) => (
              <li
                key={index}
                className={currentChatIndex === index ? "active" : ""}
                onClick={() => loadChat(index)}
              >
                <span className="chat-name">{chatNames[index]}</span>
                <span className="chat-actions">
                  <FaEdit className="icon" onClick={(e) => { e.stopPropagation(); renameChat(index); }} />
                  <FaTrash className="icon" onClick={(e) => { e.stopPropagation(); deleteChat(index); }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={`chat-container ${sidebarOpen ? "sidebar-open" : ""}`} style={{ width: sidebarOpen ? "calc(100% - 250px)" : "100%" }}>
        <header className="chat-header">
          {!sidebarOpen && (
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <FaBars />
            </button>
          )}

          <div className="logo-container">
            <img src={logor} alt="Logo" className="logo" />
            <h2>ImiGPT</h2>
          </div>

          <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-toggle">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </header>

        <button className="user-profile">
          <FaUser />
        </button>





        {showWelcome ? (
  <div className="welcome-screen">
    <h2>Welcome! How can I help you today?</h2>
    
    <div className="welcome-buttons">
      <button
        className="prompt-button"
        onClick={() => handlePromptClick("smartContract")}
      >
        📝 Generate Smart Contract
      </button>

      <button
        className="prompt-button"
        onClick={() => handlePromptClick("nft")}
      >
        🎨 Generate NFT
      </button>

      <button
        className="prompt-button"
        onClick={() => handlePromptClick("token")}
      >
        💰 Create Token
      </button>

      <button
        className="prompt-button"
        onClick={() => handlePromptClick("audit")}
      >
        🔍 Audit Smart Contract
      </button>
    </div>
  </div>
) : (
        <div className="chat-box" ref={chatBoxRef}>
  {chat.map((msg, index) => (
    <div key={index} className={`chat-message ${msg.sender}`}>
      {/* Icons appear only for user messages */}
      {msg.sender === "user" && (
        <div className="message-actions">
          <FaEdit className="icon" onClick={() => editMessage(msg)} />
          <FaCopy className="icon" onClick={() => copyMessage(msg)} />
        </div>
      )}

      {/* Sender Label */}
      <div className="message-header">
        {msg.sender === "bot" && <img src={logor} alt="Bot Logo" className="bot-logo" />}
        <span className="message-sender">{msg.sender === "user" ? "You" : "ImiGPT"}</span>
      </div>

      {/* Message Content */}
      <div className="message-text">
  {parseMessage(msg.text).map((part, idx) => (
    part.type === "code" ? (
      <div key={idx} className="code-container">
        <button
          className="copy-button"
          onClick={() => handleCopy(part.content)}
        >
          <FaCopy />
        </button>

        <SyntaxHighlighter language="solidity" style={oneDark} customStyle={{ borderRadius: "10px" }}>
          {part.content}
        </SyntaxHighlighter>
      </div>
    ) : (
      <p key={idx}>{part.content}</p>
    )
  ))}
</div>




      <span className="message-time">{msg.time}</span>
    </div>
  ))}
</div>)};

        <div className="chat-input">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button className="voice-button">
            <FaMicrophone />
          </button>
          <button className="send-button" onClick={sendMessage}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;






//faster responses
// const sendMessage = async () => {
//   if (!message.trim()) return;
//   if (showWelcome) setShowWelcome(false);

//   const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const newMessage = { text: message, sender: "user", time };
//   setChat((prevChat) => [...prevChat, newMessage]);

//   if (currentChatIndex !== null && chat.length === 0) {
//     const firstWords = message.split(" ").slice(0, 3).join(" ");
//     const updatedNames = [...chatNames];
//     updatedNames[currentChatIndex] = firstWords || `Chat ${currentChatIndex + 1}`;
//     setChatNames(updatedNames);
//   }

//   setMessage("");

//   try {
//     const res = await fetch("http://localhost:5000/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message, user_id: "user123" }),
//     });

//     if (!res.ok) {
//       throw new Error("Failed to fetch response from server");
//     }

//     const reader = res.body.getReader();
//     let botResponse = "";
//     let insideThink = false; // Track if we are inside <think> tags

//     const processStream = async () => {
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const text = new TextDecoder().decode(value).trim();
//         if (!text) continue;

//         text.split("\n").forEach((line) => {
//           try {
//             const jsonChunk = JSON.parse(line);
//             let chunkText = jsonChunk.response || "";
            
//             // 🚀 **Filter out <think> and its content**
//             if (chunkText.includes("<think>")) {
//               insideThink = true;
//               return; // Ignore this chunk
//             }
//             if (insideThink) {
//               if (chunkText.includes("</think>")) {
//                 insideThink = false;
//               }
//               return; // Skip until </think> is found
//             }

//             // Append valid bot response text
//             botResponse += chunkText + " ";

//             // Update chat UI live
//             setChat((prevChat) => [...prevChat.slice(0, -1), { text: botResponse.trim(), sender: "bot", time }]);

//           } catch (err) {
//             console.warn("Skipping invalid JSON chunk:", line);
//           }
//         });
//       }
//     };

//     // Show "Thinking..." message while waiting for response
//     setChat((prevChat) => [...prevChat, { text: "Thinking...", sender: "bot", time }]);

//     await processStream();

//     // Save conversation in history
//     setPreviousChats((prev) => {
//       const updatedChats = [...prev];
//       updatedChats[currentChatIndex] = chat;
//       return updatedChats;
//     });

//   } catch (error) {
//     console.error("Error:", error);
//   }
// };



























// import React, { useState, useEffect, useRef } from "react";
// import {
//   FaPaperPlane,
//   FaMicrophone,
//   FaMoon,
//   FaSun,
//   FaBars,
//   FaUser,
//   FaPlus,
// } from "react-icons/fa";
// import "./App.css";
// import logor from "./assets/logor.png";

// function App() {
//   const [message, setMessage] = useState("");
//   const [chat, setChat] = useState([]);
//   const [darkMode, setDarkMode] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [previousChats, setPreviousChats] = useState([]);
//   const chatBoxRef = useRef(null);

//   useEffect(() => {
//     chatBoxRef.current?.scrollTo({
//       top: chatBoxRef.current.scrollHeight,
//       behavior: "smooth",
//     });
//   }, [chat]);

  

//   const sendMessage = async () => {
//   if (!message.trim()) return;

//   const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const newMessage = { text: message, sender: "user", time };
//   setChat((prevChat) => [...prevChat, newMessage]);
//   setMessage("");

//   try {
//     const res = await fetch("http://34.30.186.188:5000/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message }),
//     });

//     if (!res.ok) {
//       throw new Error("Failed to fetch response from server");
//     }

//     const reader = res.body.getReader();
//     let botResponse = "";

//     const processStream = async () => {
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const text = new TextDecoder().decode(value).trim();
//         // Handle multiple JSON objects in the stream
//         text.split("\n").forEach((line) => {
//           try {
//             const jsonChunk = JSON.parse(line);
//             if (jsonChunk.response) {
//               botResponse += jsonChunk.response + " ";
//             }
//           } catch (err) {
//             console.warn("Skipping invalid JSON chunk:", line);
//           }
//         });

//         setChat((prevChat) => [...prevChat.slice(0, -1), { text: botResponse, sender: "bot", time }]);
//       }
//     };

//     setChat((prevChat) => [...prevChat, { text: "Thinking...", sender: "bot", time }]);
//     await processStream();
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };


//   const extractThoughts = (text) => {
//     const thoughtDelimiter = "Thought Process:";
//     if (text.includes(thoughtDelimiter)) {
//       const [final_answer, thoughts] = text.split(thoughtDelimiter);
//       return { final_answer: final_answer.trim(), thoughts: thoughts.trim() };
//     }
//     return { final_answer: text, thoughts: "" };
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") sendMessage();
//   };

//   return (
//     <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
//       {sidebarOpen && (
//         <div className="sidebar">
//           <button className="menu-toggle" onClick={() => setSidebarOpen(false)}>
//             <FaBars />
//           </button>
//           <button className="new-chat-button">
//             <FaPlus />
//           </button>
//           <h2>Previous Chats</h2>
//           <ul>
//             {previousChats.map((chat, index) => (
//               <li key={index} onClick={() => setChat(chat)}>
//                 Chat {index + 1}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       <div
//         className={`chat-container ${sidebarOpen ? "sidebar-open" : ""}`}
//         style={{ width: sidebarOpen ? "calc(100% - 250px)" : "100%" }}
//       >
//         <header className="chat-header">
//   {!sidebarOpen && (
//     <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
//       <FaBars />
//     </button>
//   )}

//   {/* Logo and Title Centered */}
//   <div className="logo-container">
//     <img src={logor} alt="Logo" className="logo" />
//     <h2>ImiGPT</h2>
//   </div>

//   {/* Dark Mode Toggle in the Top Center */}
//   <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-toggle">
//     {darkMode ? <FaSun /> : <FaMoon />}
//   </button>
// </header>

// {/* User Profile in the Top Right Corner */}
// <button className="user-profile">
//   <FaUser />
// </button>


// <div className="chat-box" ref={chatBoxRef}>
//   {chat.map((msg, index) => (
//     <div key={index} className={`chat-message ${msg.sender}`}>
//       <span className="message-sender">{msg.sender === "user" ? "You" : "ImiGPT"}</span>
//       <span className="message-text">{msg.text}</span>
//       <span className="message-time">{msg.time}</span>
//     </div>
//   ))}
// </div>


//         <div className="chat-input">
//           <input
//             type="text"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyPress}
//             placeholder="Type a message..."
//           />
//           <button className="voice-button">
//             <FaMicrophone />
//           </button>
//           <button className="send-button" onClick={sendMessage}>
//             <FaPaperPlane />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;
