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
      .from('taskTest')
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
    .from('taskTest')
    .delete()
    .eq('id', taskId)
    console.log("data:", data);
    console.log("error:", error);
  }

// edit a task
async function editTask(taskId: number, taskName: string, taskDescription: string) {
  console.log("Editing taskId:", taskId);
  const { data, error } = await supabase
  .from('taskTest')
  .update({ task_name: taskName, task_description: taskDescription })
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
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  editTask(task.id, editName, editDescription);
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
            <p>Status: {task.task_status || 'No status'}</p>
            <Button 
              onClick={() => {
                setCurrentEditingTaskId(task.id);
                setEditName(task.task_name);
                setEditDescription(task.task_description);
              }}
            >
              Edit task
            </Button>
            <Button  
              onClick={() => {
                deleteTask(task.id);
                window.location.reload();
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