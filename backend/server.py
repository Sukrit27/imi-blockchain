from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import requests
import re

app = Flask(__name__)
CORS(app)  # Allow frontend access

OLLAMA_URL = "http://localhost:11434/api/generate"

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    payload = {
        "model": "deepseek-r1:8b",
        "prompt": user_message,
        "system": "Answer briefly and concisely.",
        "temperature": 0.2,  
        "top_p": 0.7,        # Reduce randomness
        "stream": True       # Enables real-time response streaming
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, stream=True)

        def stream_response():
            for chunk in response.iter_content(chunk_size=1024):
                yield chunk.decode();
                return Response(stream_response(), content_type="text/plain")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
    
    
    
    
    
    
#     from flask import Flask, request, jsonify, Response
# from flask_cors import CORS
# import requests
# import re

# app = Flask(__name__)
# CORS(app)  # Allow frontend access

# OLLAMA_URL = "http://localhost:11434/api/generate"

# @app.route("/chat", methods=["POST"])
# def chat():
#     data = request.get_json()
#     user_message = data.get("message", "")

#     if not user_message:
#         return jsonify({"error": "Message is required"}), 400

#     payload = {
#         "model": "llama3.1:8b",
#         "prompt": user_message,
#         "system": "Answer briefly and concisely.",
#         "temperature": 0.2,  
#         "top_p": 0.7,        # Reduce randomness
#         "stream": True       # Enables real-time response streaming
#     }

#     try:
#         response = requests.post(OLLAMA_URL, json=payload, stream=True)

#         def stream_response():
#             for chunk in response.iter_content(chunk_size=1024):
#                 yield chunk.decode();
#                 return Response(stream_response(), content_type="text/plain")

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000)







from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import psycopg2

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"

# Connect to PostgreSQL
def get_db_connection():
    return psycopg2.connect(  
        dbname="chatbot_db",
        user="postgres",
        password="xyzab123",
        host="34.134.86.252",  # Change this if needed
        port="5432"
    )

# Store a message in the database
def store_message(user_id, message, sender):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO messages (user_id, message, sender) VALUES (%s, %s, %s)",
        (user_id, message, sender)
    )
    conn.commit()
    cur.close()
    conn.close()

# Retrieve the last 10 messages for a user
def get_message_history(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT message, sender FROM messages WHERE user_id = %s ORDER BY timestamp DESC LIMIT 10",
        (user_id,)
    )
    messages = cur.fetchall()
    cur.close()
    conn.close()
    return [{"text": msg[0], "sender": msg[1]} for msg in reversed(messages)]

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    user_id = data.get("user_id", "default_user")  # Default user ID

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Retrieve past chat messages
    history = get_message_history(user_id)

    # Format messages as context for Llama 3
    context = " ".join([f"{msg['sender']}: {msg['text']}" for msg in history])

    # Add user’s new message to the context
    full_prompt = f"{context} \nUser: {user_message}\nBot:"

    payload = {
        "model": "llama3.1:8b",
        "prompt": full_prompt,
        "system": "Answer based on previous context.",
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response_json = response.json()
        bot_reply = response_json.get("response", "I couldn't generate a response.")

        # Store user and bot messages in the database
        store_message(user_id, user_message, "user")
        store_message(user_id, bot_reply, "bot")

        return jsonify({"response": bot_reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    #final updated code
    
    
    
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import psycopg2
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/generate"

# Connect to PostgreSQL
def get_db_connection():
    return psycopg2.connect(  
        dbname="chatbot_db",
        user="postgres",
        password="xyzab123",
        host="34.134.86.252",
        port="5432"
    )

# Store a message in the database
'''def store_message(user_id, message, sender):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO messages (user_id, message, sender) VALUES (%s, %s, %s)",  # ✅ Fixed column name
        (user_id, message, sender)
    )
    conn.commit()
    cur.close()
    conn.close() '''
    
def store_message(user_id, conversation_id, message, sender):
    """
    Store a message in Redis under a unique conversation ID.
    """
    key = f"chat:{user_id}:{conversation_id}"  # Unique key per user + conversation
    message_data = {"text": message, "sender": sender}

    # Append message JSON to Redis list
    redis_client.rpush(key, json.dumps(message_data))

# Retrieve the last 10 messages for a user
#def get_message_history(user_id):
#    conn = get_db_connection()
#    cur = conn.cursor()
#    cur.execute(
#        "SELECT message, sender FROM messages WHERE user_id = %s ORDER BY timestamp DESC LIMIT 10", # ✅ Fixed >
#        (user_id,)
#    )
#    messages = cur.fetchall()
#    cur.close()
#    conn.close()
#    return [{"text": msg[0], "sender": msg[1]} for msg in reversed(messages)] #

def get_message_history(user_id, conversation_id):
    """
    Retrieve all messages from Redis for a specific conversation.
    """
    key = f"chat:{user_id}:{conversation_id}"
    messages = redis_client.lrange(key, 0, -1)  # Get all messages from Redis list
    
    if messages:
        return [json.loads(msg) for msg in messages]  # Convert JSON strings to Python dicts
    return []
@app.route("/get_chat_history", methods=["POST"])
def get_chat_history():
    data = request.get_json()
    user_id = data.get("user_id", "default_user")
    conversation_id = data.get("conversation_id", "default_convo")

    messages = get_message_history(user_id, conversation_id)
    return jsonify({"messages": messages})


'''@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print("Received data:", data)  # Debugging

    user_message = data.get("message", "")
    user_id = data.get("user_id", "default_user")  # Ensure frontend sends the correct key

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    # Retrieve past chat messages
    history = get_message_history(user_id)

    # Format messages as context for Llama 3
    context = " ".join([f"{msg['sender']}: {msg['text']}" for msg in history])

    # Add user’s new message to the context
    full_prompt = f"{context} \nUser: {user_message}\nBot:"

    payload = {
        "model": "llama3.1:8b",
        "prompt": full_prompt,
        "system": "Answer based on previous context.",
               "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response_json = response.json()
        bot_reply = response_json.get("response", "I couldn't generate a response.")

        # Store user and bot messages in the database
        store_message(user_id, user_message, "user")
        store_message(user_id, bot_reply, "bot")

        return jsonify({"response": bot_reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500 '''



@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    print("Received data:", data)  # Debugging

    user_message = data.get("message", "")
    user_id = data.get("user_id", "default_user")  
    conversation_id = data.get("conversation_id", "default_convo")  # Get conversation ID

    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    # ✅ Fetch past conversation history from Redis
    history = get_message_history(user_id, conversation_id)

    # Format messages as context for Llama 3
    context = " ".join([f"{msg['sender']}: {msg['text']}" for msg in history])

    # Add user’s new message to the context
    full_prompt = f"{context} \nUser: {user_message}\nBot:"

    payload = {
        "model": "llama3.1:8b",
        "prompt": full_prompt,
        "system": "Answer based on previous context.",
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        response_json = response.json()
        bot_reply = response_json.get("response", "I couldn't generate a response.")

        # ✅ Store messages in Redis
        store_message(user_id, conversation_id, user_message, "user")
        store_message(user_id, conversation_id, bot_reply, "bot")

        return jsonify({"response": bot_reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)