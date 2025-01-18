import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { queryGemini } from "./gemini";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLeft, setIsLeft] = useState(true);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [title, setTitle] = useState("");
  const messageRefs = useRef({});
  const [isAborted, setIsAborted] = useState(false);

  const [apiResponse, setApiResponse] = useState({}); // Store API responses
  
  const Url = "https://crudapp-ldw7.onrender.com";

  const handleQueryGemini = async (text, messageId) => {
    const answer = await queryGemini(text);
    setApiResponse((prev) => ({ ...prev, [messageId]: answer }));
  };  

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const currentTime = Date.now(); // Get the current time in milliseconds
        const response = await axios.get(`${Url}/api/messages`, {
          params: { currentTime }, // Pass the current time as a query parameter
        });
        setMessages(response.data);
        const pinned = response.data.filter((msg) => msg.correctness === 100);
        setPinnedMessages(pinned);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message = {
      text: newMessage,
      side: isLeft ? "left" : "right",
      correctness: isLeft ? "" : null,
    };

    // Detect /abort command
    if (newMessage.trim() === "/abort") {
      // Trigger shutdown endpoint
      setIsAborted(true);
      return;
    } else {
      axios
        .post(`${Url}/api/messages`, message)
        .then((response) => {
          setMessages([...messages, response.data]);
          setNewMessage("");
        })
        .catch((error) => console.error("Error saving message:", error));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      // Add a new line to the message
      setNewMessage((prev) => prev + "\n");
      e.preventDefault(); // Prevent the default behavior of Enter
    } else if (e.key === "Enter") {
      handleSend();
      e.preventDefault(); // Prevent the default behavior of Enter
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleCorrectnessChange = (id, value) => {
    const updatedMessages = messages.map((msg) =>
      msg._id === id ? { ...msg, correctness: parseInt(value) || "" } : msg
    );
    setMessages(updatedMessages);

    axios
      .patch(`${Url}/api/messages/${id}`, { correctness: parseInt(value) || "" })
      .then(() => {
        const pinned = updatedMessages.filter((msg) => msg.correctness === 100);
        setPinnedMessages(pinned);
      })
      .catch((error) => console.error("Error updating correctness:", error));
  };

  const handlePinClick = (id, text) => {
    if (messageRefs.current[id]) {
      messageRefs.current[id].scrollIntoView({ behavior: "smooth" });
    }

    // Copy the message text to the clipboard
    navigator.clipboard.writeText(text);
  };

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleTitleSubmit = (messageId) => {
    axios
      .patch(`${Url}/api/messages/${messageId}`, { title })
      .then((response) => {
        const updatedMessages = messages.map((msg) =>
          msg._id === messageId ? { ...msg, title: response.data.title } : msg
        );
        setMessages(updatedMessages);
        setPinnedMessages(
          updatedMessages.filter((msg) => msg.correctness === 100)
        );
        setTitle("");
      })
      .catch((error) => console.error("Error updating title:", error));
  };

  const handleDelete = (id) => {
    axios
      .delete(`${Url}/api/messages/${id}`)
      .then(() => {
        // Update the local messages state to remove the deleted message
        setMessages(messages.filter((msg) => msg._id !== id));
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  };

  const handleApproveAnswer = (messageId) => {
    const answer = apiResponse[messageId];
    if (answer) {
      const approvedMessage = {
        text: answer,
        side: "right", // Appending to the right side of the chat
      };
      setMessages([...messages, approvedMessage]);
      setApiResponse((prev) => {
        const updatedResponses = { ...prev };
        delete updatedResponses[messageId]; // Clear API response for the message
        return updatedResponses;
      });
    }
  };

  const handleDeclineAnswer = (messageId) => {
    setApiResponse((prev) => {
      const updatedResponses = { ...prev };
      delete updatedResponses[messageId]; // Clear API response for the message
      return updatedResponses;
    });
  };

  return (
    <div>
      {isAborted ? (
        <Navigate to="/" />
      ) : (
        <div className="container mt-3">
          {/* Pinned Messages Section */}
          <div className="pinned-messages mb-3">
            <h5>Pinned Messages</h5>
            {pinnedMessages.map((msg) => (
              <div
                key={msg._id}
                className="pinned-message p-2 mb-1 border rounded bg-secondary cursor-pointer"
                onClick={() => handlePinClick(msg._id, msg.text)}
              >
                {msg.title || msg.text}
              </div>
            ))}
            {pinnedMessages.length === 0 && (
              <p className="text-muted">No pinned messages</p>
            )}
          </div>

          {/* Chat Messages Section */}
          <div
            className={`chat-container border rounded p-3 ${
              isLeft ? "chat-left" : "chat-right"
            }`}
            style={{
              backgroundColor: isLeft ? "#f0f0f0" : "#e0e0e0",
              height: "50vh",
              overflowY: "auto",
              transition: "background-color 0.3s ease",
            }}
          >
            {messages.map((msg, index) => (
              <div
                id={`msg_${index}`}
                key={msg._id}
                ref={(el) => (messageRefs.current[msg._id] = el)}
                className={`d-flex ${
                  msg.side === "left"
                    ? "justify-content-start"
                    : "justify-content-end"
                } mb-2`}
                style={{
                  backgroundColor: msg.side === "left" ? "#f0f8ff" : "#ffe4e1", // Light blue for left, Light pink for right
                  borderRadius: "10px",
                  padding: "10px",
                  maxWidth: "100%", // Adjust to fit messages properly
                }}
              >
                <button
                  style={{
                    backgroundColor: "#c3a9a9", // Dull red color
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                  }}
                  onClick={() => handleDelete(msg._id)}
                >
                  X
                </button>
                <div className="message p-2 rounded bg-white shadow-sm">
                  <div className="d-flex align-items-center">
                    <span>{msg.text}</span>
                    <button
                      className="btn btn-sm btn-secondary ms-2"
                      onClick={() => handleCopy(msg.text)}
                    >
                      Copy
                    </button>
                    {msg.side === "right" && (
                      <button
                        className="btn btn-sm btn-primary ms-2"
                        onClick={() => handleQueryGemini(msg.text, msg._id)}
                      >
                        Ask Gemini
                      </button>
                    )}
                  </div>

                  {apiResponse[msg._id] && (
                    <div className="api-response mt-2 p-2 border rounded bg-light">
                      <p>{apiResponse[msg._id]}</p>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => handleApproveAnswer(msg._id)}
                      >
                        ✅ Yes
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeclineAnswer(msg._id)}
                      >
                        ❌ No
                      </button>
                    </div>
                  )}
                  {msg.side === "left" && (
                    <div>
                      <input
                        type="number"
                        className="form-control mt-2"
                        placeholder="Correctness (%)"
                        value={msg.correctness || ""}
                        onChange={(e) =>
                          handleCorrectnessChange(msg._id, e.target.value)
                        }
                      />
                      {msg.correctness === 100 && !msg.title && (
                        <div className="mt-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter title for pinned message"
                            value={title}
                            onChange={handleTitleChange}
                          />
                          <button
                            className="btn btn-secondary mt-2"
                            onClick={() => handleTitleSubmit(msg._id)}
                          >
                            Submit Title
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Section */}
          <div className="mt-3">
            <div className="d-flex flex-column flex-md-row">
              <button
                className="btn btn-secondary me-md-2 mb-2 mb-md-0"
                onClick={() => setIsLeft(!isLeft)}
              >
                {isLeft ? "Left" : "Right"}
              </button>
              <textarea
                className="form-control me-md-2 mb-2 mb-md-0"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress} // Use onKeyDown for key handling
                placeholder="Type your message..."
                rows={3} // Optional: Set the number of rows for the textarea
              />
              <button className="btn btn-secondary" onClick={handleSend}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
