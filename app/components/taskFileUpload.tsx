'use client'

import { useState } from 'react'
import { useSession } from '@clerk/nextjs'
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/Button'

export interface FileInfo {
  path: string;
  name: string;
  type: string;
}

interface FileUploadProps {
  bucketName: string;
  taskId: number;
  onUpload: (files: FileInfo[], taskId: number, supabase: any) => void;
  accept?: string;
  multiple?: boolean;
}

export function TaskFileUpload({ 
  bucketName, 
  taskId,
  onUpload, 
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.tiff,.tif",
  multiple = true 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const { session } = useSession()
  const supabase = createClerkSupabaseClient(session)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files)
  }

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.error('No files selected')
      return
    }

    try {
      setUploading(true)
      const uploadedFiles: FileInfo[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const fileExt = file.name.split('.').pop()
        const filePath = `task_files/${session.user.id}/${taskId}/${Math.random()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file)

        if (uploadError) {
          throw uploadError
        }

        uploadedFiles.push({
          path: filePath,
          name: file.name,
          type: file.type
        })
      }

      onUpload(uploadedFiles, taskId, supabase)
      setSelectedFiles(null)
      const fileInput = document.getElementById(`files-${taskId}`) as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`files-${taskId}`}>Choose Files</Label>
        <Input
          id={`files-${taskId}`}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>
      {selectedFiles && selectedFiles.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            {selectedFiles.length} file(s) selected
          </p>
          <Button
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      )}
    </div>
  )
}