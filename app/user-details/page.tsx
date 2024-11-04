'use client'

import { useState, useEffect } from 'react'
import { useUser, useSession } from '@clerk/nextjs'
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Button } from '@/app/components/ui/Button'
import { FileUpload, FileInfo } from '@/app/components/additionalFileUpload'
import { AdditionalFileDisplay } from '@/app/components/additionalFileDisplay'
import LoadingSpinner from '@/app/components/LoadingSpinner';


interface UserInfo {
  [key: string]: string;
}

export default function UserDetailsPage() {
  const { user } = useUser()
  const { session } = useSession()
  const [userInfo, setUserInfo] = useState<UserInfo>({})
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editableInfo, setEditableInfo] = useState<UserInfo>({})
  const [isUploading, setIsUploading] = useState(false)
  
  const supabase = createClerkSupabaseClient(session)

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
        setEditableInfo(infoObj);
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
      ...editableInfo
    };

    const { error } = await supabase
      .from('userDetails')
      .upsert(updates);

    if (error) {
      console.error('Error updating user info:', error);
    } else {
      setUserInfo(editableInfo);
      setIsEditing(false);
      console.log('User info updated successfully');
    }
  }

  const handleUpload = async (files: FileInfo[]) => {
    try {
      // Insert file references into the database
      const { error } = await supabase
        .from('additionalFiles')
        .insert(
          files.map(file => ({
            user_id: user?.id,
            file_path: file.path,
            file_name: file.name,
            file_type: file.type
          }))
        )

      if (error) throw error
      console.log('Files uploaded successfully')
      
      // Add window reload after successful upload
      window.location.reload();
      
    } catch (error) {
      console.error('Error saving file references:', error)
      setIsUploading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {isUploading && (
        <LoadingSpinner message="Lifey is uploading your files now..." />
      )}
      
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Edit your details below'
              : 'Your current details are shown below'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              {requiredFields.map(field => (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Input
                    id={field.key}
                    value={editableInfo[field.key] || ''}
                    onChange={(e) => setEditableInfo(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-4 mt-4">
                <Button type="submit">Save Changes</Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setEditableInfo(userInfo);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              {requiredFields.map(field => (
                <div key={field.key}>
                  <Label>{field.label}</Label>
                  <p className="mt-1">{userInfo[field.key] || 'Not provided'}</p>
                </div>
              ))}
              <Button 
                type="button" 
                onClick={() => setIsEditing(true)}
                className="mt-4"
              >
                Edit Details
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
          <CardDescription>
            Upload your important documents here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            bucketName="user-documents"
            onUpload={(files) => {
              setIsUploading(true);  // Set loading state when upload starts
              return handleUpload(files);
            }}
          />
          <AdditionalFileDisplay 
            userId={user?.id}
            supabase={supabase}
            tableName="additionalFiles"
            onDelete={() => window.location.reload()}
          />
        </CardContent>
      </Card>
    </div>
  );
}

