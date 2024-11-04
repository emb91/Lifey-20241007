'use client'
import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js';
import { log } from 'console'
import Link from 'next/link';
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient';
import { Button } from '../components/ui/Button';
import { TaskFileUpload, FileInfo } from '@/app/components/taskFileUpload'
import { FileDisplay } from '@/app/components/FileDisplay';
import LoadingSpinner from '@/app/components/LoadingSpinner';


export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [currentEditingTaskId, setCurrentEditingTaskId] = useState<number | null>(null);
  const [editAdditionalInfo, setEditAdditionalInfo] = useState("");
  const { user } = useUser();
  const { session } = useSession();
  const supabase = createClerkSupabaseClient(session);
  const [isUploading, setIsUploading] = useState(false)


  const handleTaskFileUpload = async (files: FileInfo[], taskId: number, supabaseClient: any) => {
    try {
      window.console.error('1. Starting file upload, files:', files);

      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      if (!taskId) {
        throw new Error('No taskId provided');
      }

      if (!supabaseClient) {
        throw new Error('No supabaseClient provided');
      }

      const { data: fileData, error: fileError } = await supabaseClient
        .from('taskFiles')
        .insert(
          files.map(file => ({
            user_id: user?.id,
            task_id: taskId,
            file_path: file.path,
            file_name: file.name,
            file_type: file.type
          }))
        )
        .select('id');

      if (fileError) {
        window.console.error('2. Error inserting files:', fileError);
        throw fileError;
      }
      
      window.console.error('3. Successfully inserted files:', fileData);

      // Get current taskFiles_ID array from tasks table
      const { data: taskData, error: taskError } = await supabaseClient
        .from('tasks')
        .select('taskFiles_ID')
        .eq('id', taskId)
        .single();

      if (taskError) throw taskError
      console.log('Task data:', taskData);

      // Combine existing and new file IDs
      const existingIds = taskData?.taskFiles_ID || [];
      const newIds = fileData.map(file => file.id);
      const allIds = [...existingIds, ...newIds];
      console.log('All IDs:', allIds);

      // Update the tasks table with the new array of file IDs
      const { error: updateError } = await supabaseClient
        .from('tasks')
        .update({ taskFiles_ID: allIds })
        .eq('id', taskId);

      if (updateError) throw updateError
      console.log('Task files uploaded and linked successfully');
      
      // Add window reload after successful upload
      window.location.reload();
      
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        error: error,
        files: files,
        taskId: taskId,
        userId: user?.id
      });
      setIsUploading(false);
    }
  }

  useEffect(() => {
    if (!user) return

    console.log(user);
    console.log(supabase);
    

    async function loadTasks() {
      setLoading(true)
      const { data, error } = await supabase
      .from('tasks')
      .select()
      .order('created_at', { ascending: false })
      console.log(data);
      if (!error) setTasks(data)
      setLoading(false)
    }

    loadTasks()
  }, [user])

  // Delete a task
  async function deleteTask(taskId: number) {
    console.log("Deleting taskId:", taskId);
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      // Update the tasks state to remove the deleted task
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } else {
      console.log("error:", error);
    }
  }

// edit a task
async function editTask(taskId: number, taskName: string, taskDescription: string, additionalInformation: string) {
  console.log("Editing taskId:", taskId);
  const { data, error } = await supabase
    .from('tasks')
    .update({ task_name: taskName, task_description: taskDescription, additional_information: additionalInformation })
    .eq('id', taskId)
}

  // Render the tasks
  return (
    <div>
      {isUploading && (
        <LoadingSpinner message="Lifey is uploading your files now..." />
      )}
      
      <h1>Tasks</h1>
      <Link href="/">
        <Button 
          type="button"
        >
          Go Home
        </Button>
      </Link>
      <Link href="/create-task">
        <Button 
        type="button"
        >
          Create a new task
        </Button>
      </Link>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length > 0 && tasks.map((task: any) => 
      <div key={task.id}>
        {currentEditingTaskId === task.id ? (
          // Edit mode
          <div>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="px-4 py-2 border rounded-full mb-2 w-full"
              placeholder="Task name"
            />
            <input
              type="text"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="px-4 py-2 border rounded-full mb-2 w-full"
              placeholder="Task description"
            />
            <input
              type="text"
              value={editAdditionalInfo}
              onChange={(e) => setEditAdditionalInfo(e.target.value)}
              className="px-4 py-2 border rounded-full mb-2 w-full"
              placeholder="Additional Information"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  editTask(task.id, editName, editDescription, editAdditionalInfo);
                  setCurrentEditingTaskId(null);
                  window.location.reload();
                }}
              >
                Save
              </Button>
              <Button 
                onClick={() => {
                  setCurrentEditingTaskId(null);
                  setEditName("");
                  setEditDescription("");
                  setEditAdditionalInfo("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          // View mode
          <>
            <h2>Task Name: {task.task_name}</h2>
            <p>Task number: {task.id}</p>
            <p>{task.task_description}</p>
            <p>Additional Information: {task.additional_information || 'No additional information'}</p>
            <p>Status: {task.task_status || 'No status'}</p>
            <Button 
              onClick={() => {
                setCurrentEditingTaskId(task.id);
                setEditName(task.task_name);
                setEditDescription(task.task_description);
                setEditAdditionalInfo(task.additional_information || "");
              }}
            >
              Edit task
            </Button>
            <Button  
              onClick={() => {
                deleteTask(task.id);
              }}
            >
              Delete task
            </Button>
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Upload Files for this Task</h3>
              <TaskFileUpload
                bucketName="user-documents"
                taskId={task.id}
                onUpload={(files, taskId) => {
                  setIsUploading(true);
                  console.error('TaskFileUpload onUpload called with:', { files, taskId });
                  return handleTaskFileUpload(files, taskId, supabase);
                }}
              />
              <FileDisplay 
                taskId={task.id}
                fileIds={task.taskFiles_ID || []}
                supabase={supabase}
                tableName="taskFiles"
                onDelete={() => window.location.reload()}
              />
            </div>
          </>
        )}
      </div>
      )}

      {!loading && tasks.length === 0 && <p>No tasks found</p>}

    </div>
  )
}