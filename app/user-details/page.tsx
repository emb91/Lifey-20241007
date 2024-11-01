'use client'

import { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/Button'

interface UserInfo {
  [key: string]: string;
}

export default function UserDetailsPage() {
  const { user } = useUser()
  const { session } = useSession()
  
  // Add these debug logs
  useEffect(() => {
    console.log('Session state:', {
      exists: !!session,
      session: session
    });
  }, [session]);

  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClerkSupabaseClient(session)
    console.log('Supabase client logged:', supabase)

  // Define the fields needed for the current task context
  const requiredFields = [
    { key: 'phone_number', label: 'Phone number', placeholder: '0220112233' },
    { key: 'user_address', label: 'Home address', placeholder: '123 Queen Street, Auckland' },
    { key: 'gp_name', label: 'GP name', placeholder: 'Dr. Chris Warner' },
    { key: 'gp_address', label: 'GP address', placeholder: '1 Shortland Street, Auckland' },
    { key: 'other_information', label: 'Other information', placeholder: 'Let us know anything else that is important for completing the task' },
  ]

  useEffect(() => {
    async function loadUserInfo() {
      if (!user) return

      const { data, error } = await supabase
        .from('userDetails')
        .select()
        .eq('user_id', user.id)

      if (data) {
        const infoObj: UserInfo = {};
        data.forEach(item => {
          Object.keys(item).forEach(key => {
            if (key !== 'created_at' && key !== 'user_id') {
              infoObj[key] = item[key];
            }
          });
        });
        setUserInfo(infoObj);
      }
      setLoading(false);
    }

    loadUserInfo();
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const updates = {
      user_id: user.id,
      ...userInfo  // This spreads all the field values directly
    };

    // Upsert the data
    const { error } = await supabase
      .from('userDetails')
      .upsert(updates);

    if (error) {
      console.error('Error updating user info:', error);
    } else {
      console.log('User info updated successfully');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>If you have any tasks that require additional information, please enter them in the fields below.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {requiredFields.map(field => (
            <div key={field.key}>
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                value={userInfo[field.key] || ''}
                onChange={(e) => setUserInfo(prev => ({
                  ...prev,
                  [field.key]: e.target.value
                }))}
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Details</Button>
        </CardFooter>
      </Card>
    </form>
  );
}