'use client'

import { useState } from 'react'
import { useSession } from '@clerk/nextjs'
import { createClerkSupabaseClient } from '../utils/createClerkSupabaseClient'
import { Input } from './ui/input'
import { Label } from './ui/label'

export interface FileInfo {
  path: string;
  name: string;
  type: string;
}

interface FileUploadProps {
  bucketName: string;
  onUpload: (files: FileInfo[]) => void;
  accept?: string;
  multiple?: boolean;
}

export function FileUpload({ 
  bucketName, 
  onUpload, 
  accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.tiff,.tif",
  multiple = true 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const { session } = useSession()
  const supabase = createClerkSupabaseClient(session)

  const uploadFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select a file to upload.')
      }

      const files = event.target.files
      const uploadedFiles: FileInfo[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const filePath = `${session.user.id}/${Math.random()}.${fileExt}`

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

      onUpload(uploadedFiles)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <Label htmlFor="files">Upload Files</Label>
      <Input
        id="files"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={uploadFiles}
        disabled={uploading}
      />
    </div>
  )
}