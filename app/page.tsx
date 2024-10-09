"use client";


import styles from "./shared/page.module.css";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";



const HomePage = () => {
  const { user } = useUser();

  // Log the Clerk user details
  if (user) {
    console.log("Clerk user details:", user);
  }

  return (
    <main>
      <div>
        <div>
          <h1>Welcome to Lifey</h1>
        </div>
      </div>
      <div>
        <div >
        <Link href="/create-task">
          <button type="button">Give Lifey a task</button>
          </Link>
          <Link href="/get-tasks">
          <button type="button">See your tasks</button>
          </Link>
          <div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;


// import React from "react";
// import styles from "./shared/page.module.css";
// import Chat from "./components/chat";
// import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
// import { createClient } from '@/app/utils/supabase/client';
// import axios from 'axios'; // 
// import Link from "next/link";

// // const ChatPage = () => {
// //   const functionCallHandler = async (toolCall: RequiredActionFunctionToolCall) => {
// //     console.log("Function call received:", toolCall);

// //     let output = "";
// //     const supabase = createClient();

// //     if (toolCall.function.name === "create-task") {
// //       try {
// //         const taskInfo = JSON.parse(toolCall.function.arguments);
        
// //         // Prepare the task data to match the table structure
// //         const taskData = {
// //           task_name: taskInfo.title, 
// //           task_description: taskInfo.description, 
// //         };

// //         // Use Supabase client to create the task
// //         const { data, error } = await supabase
// //           .from('taskTest')
// //           .insert(taskData)
// //           .select()
// //           .single();

// //         if (error) {
// //           throw error;
// //         }

// //         console.log('Task created:', data);
        
// //         // Set the output
// //         output = JSON.stringify({ success: true, taskId: data.id });
// //       } catch (error) {
// //         console.error("Error creating task:", error);
// //         output = JSON.stringify({ success: false, error: "Failed to create task" });
// //       }
// //     }

// //     // Submit the tool output using the API route
// //     try {
// //       const response = await axios.post('/api/submitToolOutputs', {
// //         threadId: "thread_mP61srHBRbUg77ktFvKcJqiS",
// //         runId: "run_KwCd7cZs4ojVNiyyfyN1K1ax",
// //         assistantId: process.env.NEXT_PUBLIC_ASSISTANT_ID, // Updated to match your .env file
// //         toolOutputs: [
// //           {
// //             tool_call_id: toolCall.id,
// //             output: output,
// //           },
// //         ],
// //       });
// //       console.log("Tool output submitted:", response.data);
// //     } catch (error) {
// //       console.error("Error submitting tool output:", error.response?.data || error.message);
// //     }

// //     return output;
// //   };

  
//     <main className={styles.main}>
//       <div className={styles.container}>
//         <div className={styles.chatContainer}>
//           <h1>Home page</h1>
//           <Link href="/create-task">Go to create task page</Link>
//           <div className={styles.chat}>
//             <Chat functionCallHandler={functionCallHandler} />
//           </div>
//         </div>
//       </div>
//     </main>;
// };

// export default ChatPage;
