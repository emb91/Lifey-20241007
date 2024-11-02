'use client'
import { useEffect, useState } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js';
import { log } from 'console'
import Link from 'next/link';
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient';
import { Button } from '../components/ui/Button';


export default function Home() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [currentEditingTaskId, setCurrentEditingTaskId] = useState<number | null>(null);
  const [editAdditionalInfo, setEditAdditionalInfo] = useState("");
  // The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
  const { user } = useUser();
  // The `useSession()` hook will be used to get the Clerk session object
  const { session } = useSession();
  const supabase = createClerkSupabaseClient(session);


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
            <h2>{task.task_name}</h2>
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
          </>
        )}
      </div>
      )}

      {!loading && tasks.length === 0 && <p>No tasks found</p>}

    </div>
  )
}