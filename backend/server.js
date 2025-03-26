require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POST endpoint to handle chat messages
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    // Start the chat completion with streaming
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: 
            'You are an expert blockchain developer specialized in writing secure and optimized smart contracts. ' +
            'You will ONLY provide complete and functional smart contracts in Solidity language based on user requirements. ' +
            'Do not include explanations or comments unless explicitly asked. ' +
            'Respond with ONLY the Solidity code, properly formatted, and wrapped in triple backticks.' 
        },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true
    });

    // Setup Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream response data to frontend
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ response: content })}\n\n`);
      }
    }

    // End the stream when done
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('OpenAI Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});





















// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const compression = require("compression"); 

// const app = express();
// const PORT = 5000;

// app.use(cors({
//   origin: "*", 
//   methods: ["POST"],
//   allowedHeaders: ["Content-Type"]
// }));

// app.use((req, res, next) => {
//   res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
//   next();
// });



// app.use(express.json()); // To parse JSON request body
// app.use(compression());

// const OLLAMA_URL = "http://127.0.0.1:11434/api/generate"; // Ollama API

// app.post("/chat", async (req, res) => {
//   const userMessage = req.body.message;

//   if (!userMessage) {
//     return res.status(400).json({ error: "Message is required" });
//   }

//   const payload = {
//     model: "deepseek-r1:8b",
//     prompt: userMessage,
//     system: "Answer briefly and concisely.",
//     temperature: 0.2,
//     top_p: 0.7,
//     stream: true,
//   };

//   try {
//     const response = await axios.post(OLLAMA_URL, payload, { responseType: "stream" });

//     res.setHeader("Content-Type", "text/plain");
//     res.setHeader("Transfer-Encoding", "chunked");

//     let buffer = "";
//     let insideThinkTag = false;
//     let thinkReplaced = false;
    
//     response.data.on("data", (chunk) => {
//       buffer += chunk.toString(); // Append new chunk to buffer
//       let cleanResponse = "";
//       let i = 0;

//       while (i < buffer.length) {
//         if (buffer.slice(i, i + 7) === "<think>") {
//           insideThinkTag = true;
//           if (!thinkReplaced) {
//             cleanResponse += "thinking... "; // Replace only the first occurrence
//             thinkReplaced = true;
//           }
//           i += 7;
//         } else if (buffer.slice(i, i + 8) === "</think>") {
//           insideThinkTag = false;
//           i += 8;
//         } else {
//           if (!insideThinkTag) {
//             cleanResponse += buffer[i]; // Add only non-think content
//           }
//           i++;
//         }
//       }

//       buffer = insideThinkTag ? buffer.slice(buffer.lastIndexOf("<think>")) : ""; // Retain unprocessed data
//       res.write(cleanResponse);
//       res.flush();
//     });

//     response.data.on("end", () => res.end());
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Failed to communicate with Ollama" });
//   }
// });


// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });



// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on http://0.0.0.0:${PORT}`);
// });

































// const express = require("express");
// const cors = require("cors");
// const axios = require("axios");
// const compression = require("compression"); 

// const app = express();
// const PORT = 5000;

// app.use(cors({
//   origin: "*", 
//   methods: ["POST"],
//   allowedHeaders: ["Content-Type"]
// }));

// app.use((req, res, next) => {
//   res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
//   next();
// });



// app.use(express.json()); // To parse JSON request body
// app.use(compression());

// const OLLAMA_URL = "http://127.0.0.1:11434/api/generate"; // Ollama API

// app.post("/chat", async (req, res) => {
//   const userMessage = req.body.message;

//   if (!userMessage) {
//     return res.status(400).json({ error: "Message is required" });
//   }

//   const payload = {
//     model: "deepseek-r1:8b",
//     prompt: userMessage,
//     system: "Answer briefly and concisely.",
//     temperature: 0.2,
//     top_p: 0.7,
//     stream: true, // Enable streaming
//   };
//   try {
//     const response = await axios.post(OLLAMA_URL, payload, { responseType: "stream" });

//     res.setHeader("Content-Type", "text/plain");
//     res.setHeader("Transfer-Encoding", "chunked");

//     response.data.on("data", (chunk) => {
//       res.write(chunk.toString()); // Stream response to frontend
//       res.flush(); 
//     });

//     response.data.on("end", () => res.end());
//   } catch (error) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "Failed to communicate with Ollama" });
//   }
// });
// app.get("/", (req, res) => {
//   res.send("Server is running!");
// });



// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on http://0.0.0.0:${PORT}`);
// });
