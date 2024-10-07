import { OpenAI } from "openai";
import { createClient } from '@supabase/supabase-js';


// Define types for better type safety
interface AssistantOutput {
  title: string;
  description: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('Missing OpenAI API Key');
}

const openai = new OpenAI({  
  apiKey: openaiApiKey,
});

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key');
}
console.log('Creating Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Supabase client created successfully');

// Function to insert task into Supabase
export const createTaskInSupabase = async (
  title: string, 
  description: string, 
): Promise<any> => {
  console.log("Inserting task into Supabase:", { title, description });

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        { 
          created_at: new Date(),
          task_name: title, 
          task_description: description, 
        }
      ]);

    if (error) {
      console.error("Error inserting task into Supabase:", error);
      throw new Error(error.message);
    }

    console.log("Task successfully inserted:", data);
    return data;
  } catch (error) {
    console.error("Error in Supabase insertion:", error);
    throw error;
  }
};

// Function to handle creating the task
export const handleCreateTask = async (assistantOutput: any) => {
  console.log("Handling task creation for output:", assistantOutput);
  
  try {
    let taskInfo;
    if (typeof assistantOutput === 'string') {
      // If assistantOutput is a string, parse it
      taskInfo = JSON.parse(assistantOutput);
    } else if (assistantOutput.function && assistantOutput.function.arguments) {
      // If it's an object with a function property, parse the arguments
      taskInfo = JSON.parse(assistantOutput.function.arguments);
    } else {
      throw new Error('Invalid assistant output format');
    }
    
    if (!taskInfo.title || !taskInfo.description) {
      throw new Error('Missing title or description in task information');
    }

    const { title, description } = taskInfo;

    if (title.split(' ').length > 7) {
      throw new Error('Title should not be more than 7 words');
    }

    if (description.split(' ').length > 200) {
      throw new Error('Description should not be more than 200 words');
    }

    // Save the task to Supabase
    console.log("Creating task in Supabase...");
    const result = await createTaskInSupabase(title, description);

    console.log("Task creation result:", result);
    return result;
  } catch (error) {
    console.error("Error handling task creation:", error);
    throw error;
  }
};
