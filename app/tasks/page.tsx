import { createClient } from '../utils/supabase/server';

  export default async function Tasks() {
    const supabase = createClient();
    const { data: tasks } = await supabase.from("tasks").select();

    return <pre>{JSON.stringify(tasks, null, 2)}</pre>

  }