import { NextResponse } from 'next/server';
import { handleCreateTask } from '@/app/utils/tasks';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleCreateTask(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/tasks:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}