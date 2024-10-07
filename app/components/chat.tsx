"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../shared/chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
import { AssistantStreamEvent } from "openai/resources/beta/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import Popup from "./popup";

// Defines the structure for message props
type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

// Component to render user messages
const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

// Component to render assistant messages with Markdown support
const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

// Component to render code messages with line numbers
const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

// Component to render messages based on their role
const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type User = { id: string; firstName: string; lastName: string };

// Defines the structure for Chat component props
type ChatProps = {
  user: User;
  threadId: string;
  setThreadId: (threadId: string) => void;
  runId: string;
  setRunId: (runId: string) => void;
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
};

// Main Chat component
const Chat = ({
  user,
  threadId,
  setThreadId,
  runId,
  setRunId,
  functionCallHandler = async () => "", // provide a default that returns an empty string
}: ChatProps) => {
  // State variables for managing chat functionality
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([""]);
  const [inputDisabled, setInputDisabled] = useState(true);
  // const [threadId, setThreadId] = useState("");
  const [error, setError] = useState("");
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Ref for handling intiial message sent
  const initialMessageSent = useRef(false);

  // Ref and function for auto-scrolling to the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect to create a new thread ID when the chat component is created
  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      console.log("SETTING THREAD ID:", data.threadId);
      setThreadId(data.threadId);
      };
      createThread();
  }, [user]);

  // Effect to send an initial message when thread ID is set
  useEffect(() => {
    if (threadId && !initialMessageSent.current && user) {
      const timer = setTimeout(() => {
        sendMessage(`hey lifey!${user?.firstName ? ` my name is ${user.firstName}` : ''}`);
        initialMessageSent.current = true;
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [threadId]);

   // Effect to show chat when first message is received from assistant
   useEffect(() => {
    if (messages.length === 2) {
      setInputDisabled(false);
    }
  }, [messages]);


  // Function to send a message to the API
  const sendMessage = async (text) => {
    console.log("Current threadId:", threadId);  // Check if this is populated
    if (!threadId) {
      console.error("Thread ID is missing!");
      return;
    }

    console.log(`Sending message: "${text}" to thread: ${threadId}`);

    const response = await fetch(`/api/assistants/threads/${threadId}/messages`, {
      method: "POST",
      body: JSON.stringify({ 
        content: text }),
    });
    
    console.log("Message sent successfully");

    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  // Function to submit action results to the API
  const submitActionResult = async (runId, toolCallOutputs) => {
    try {
      console.log(`[Action Required] Submitting action result for Thread ID: ${threadId}, Run ID: ${runId}`);
      console.log('Action details:', toolCallOutputs);

      const response = await fetch(
        `/api/assistants/threads/${threadId}/actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            runId: runId,
            toolCallOutputs: toolCallOutputs,
          }),
        }
      );

      console.log(`[Action Response] Status: ${response.status}`);

      if (response.status === 200) {
        setPopupMessage("Task created successfully!");
        setIsPopupOpen(true);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
      }

      const result = await response.json();
      console.log("Action result:", result);

      handleRunCompleted(result);

    } catch (error) {
      console.error("Error in submitActionResult:", error);
      setError(`An error occurred: ${error.message}`);
      // We'll still call handleRunCompleted to unblock the UI
      handleRunCompleted();
    }
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // Function to handle text creation event
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // Function to handle text delta event
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    };
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // Function to handle image file completion event
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  }

  // Function to handle tool call creation event
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // Function to handle tool call delta event
  const toolCallDelta = (delta, snapshot) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // Function to handle required action event
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    console.log("handleRequiresAction called");
    const newRunId = event.data.id;
    console.log("New Run ID:", newRunId);
    setRunId(newRunId);
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(newRunId, toolCallOutputs);
  };

  // Function to handle run completion event
  const handleRunCompleted = (result?: any) => {
    setInputDisabled(false);
    console.log("Run completed:", result);
    // Add any additional logic you need here
  };

  // Function to handle the readable stream
  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  // Function to append text to the last message
  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  // Function to append a new message
  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  // Function to annotate the last message
  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      })
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  }

  // Function to close the popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Render the chat interface
  return (
    <div className={styles.chatContainer}>
      {!initialMessageSent.current && messages.length < 2 &&
        <div className={styles.messages}>
          <Message role="assistant" text="Waking up Lifey..." />
        </div>
      }
      {initialMessageSent.current && messages.length >= 2 &&
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      }
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={`Hey ${user.firstName}, give me a task!`}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
      <Popup
        isOpen={isPopupOpen}
        onClose={closePopup}
        message={popupMessage}
      />
    </div>
  );
};

export default Chat;