"use client";

import React from "react";
import styles from "../shared/page.module.css";
import Chat from "../components/chat";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Link from "next/link";
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient';
import { Button } from '../components/ui/Button';

const ChatPage = () => {

const [loading, setLoading] = useState(true)
const [threadId, setThreadId] = useState<string | null>(null);
const [runId, setRunId] = useState<string | null>(null);
const runIdRef = useRef<string | null>(null);

const updateRunId = (newRunId: string) => {
  console.log("Updating runId in ChatPage to:", newRunId);
  setRunId(newRunId);
  runIdRef.current = newRunId;
};

// The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
const { user } = useUser()
// The `useSession()` hook will be used to get the Clerk session object
const { session } = useSession()

// Add session debugging
useEffect(() => {
  console.log('Create Task - Session state:', {
    exists: !!session,
    session: session,
    sessionId: session?.id
  });
}, [session]);

const supabase = createClerkSupabaseClient(session);

// function createClerkSupabaseClient() {
//   return createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       global: {
//         // Get the custom Supabase token from Clerk
//         fetch: async (url, options = {}) => {
//           const clerkToken = await session?.getToken({
//             template: 'supabase',
//           });

//           // Insert the Clerk Supabase token into the headers
//           const headers = new Headers(options?.headers);
//           headers.set('Authorization', `Bearer ${clerkToken}`);

//           // Now call the default fetch
//           return fetch(url, {
//             ...options,
//             headers,
//           });
//         },
//       },
//     }
//   );
// }

useEffect(() => {
    if (!user) return
    setLoading(false)
  }, [user])

  const functionCallHandler = useCallback(async (toolCall: RequiredActionFunctionToolCall) => {
    console.log("Function call received:", toolCall);
    console.log("Current runId in functionCallHandler:", runIdRef.current);

    let output = "";
    
    // Create a `client` object for accessing Supabase data using the Clerk token
    // const supabase = createClerkSupabaseClient() 

    if (toolCall.function.name === "create-task") {
      try {
        const taskInfo = JSON.parse(toolCall.function.arguments);
        
        // Prepare the task data to match the table structure
        const taskData = {
          task_name: taskInfo.title, 
          task_description: taskInfo.description, 
          user_id: user?.id,
        };

        // Use Supabase client to create the task
        const { data, error } = await supabase
          .from('tasks')
          .insert(taskData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        console.log('Task created:', data);
        
        // Set the output
        output = JSON.stringify({ success: true, taskId: data.id });
      } catch (error) {
        console.error("Error creating task:", error);
        output = JSON.stringify({ success: false, error: "Failed to create task" });
      }
    }

    // Submit the tool output using the API route
    if (runIdRef.current) {
      const maxRetries = 3;
      let retries = 0;

      while (retries < maxRetries) {
        try {
          console.log(`Attempt ${retries + 1} - Waiting before submitting tool output`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

          console.log("THE PAGE RUN ID IS:", runIdRef.current);
          console.log("THE PAGE THREADID IS:", threadId);
          
          const response = await axios.post(`/api/assistants/threads/${threadId}/actions`, {
            threadId: threadId,
            runId: runIdRef.current,
            assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID,
            toolOutputs: [
              {
                tool_call_id: toolCall.id,
                output: output,
              },
            ],
          });
          console.log("Tool output submitted:", response.data);
          break; // If successful, exit the loop
        } catch (error) {
          console.error(`Error submitting tool output (attempt ${retries + 1}):`, error.response?.data || error.message);
          retries++;
          if (retries < maxRetries) {
            const delay = retries * 2000; // Increase delay with each retry
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error("Max retries reached. Failed to submit tool output.");
          }
        }
      }
    } else {
      console.error("runId is null, cannot submit tool output");
    }

    return output;
  }, [threadId, user]);

  return (
    <main className={styles.main}>
    
    {loading && 
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          <h1>Loading the botty...</h1>
        </div>
      </div>
    }

    {!loading && 
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          <h1>Give Lifey a task</h1>
          <div className={styles.buttonGroup}>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/get-tasks">
              <Button>See your tasks</Button>
            </Link>
          </div>
          <div className={styles.chat}>
            <Chat 
            user={user} 
            functionCallHandler={functionCallHandler} 
            threadId={threadId}
            setThreadId={setThreadId}
            runId={runId}
            setRunId={updateRunId}
            />
          </div>
        </div>
      </div>
    }
    </main>
  );
};

export default ChatPage;
