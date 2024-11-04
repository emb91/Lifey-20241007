'use client'

import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { DeleteConfirmationPopup } from './DeleteConfirmationPopup';

interface File {
  id: number;
  file_path: string;
  file_name: string;
  file_type: string;
  signedUrl?: string;
}

interface AdditionalDisplayProps {
  userId: string;
  supabase: any;
  tableName: string;
  onDelete?: () => void;
}

export function AdditionalFileDisplay({ userId, supabase, tableName, onDelete }: AdditionalDisplayProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    file: File | null;
  }>({ isOpen: false, file: null });

  const handleDeleteFile = async (file: File) => {
    setDeleteConfirmation({ isOpen: true, file });
  };

  const handleConfirmDelete = async () => {
    const file = deleteConfirmation.file;
    if (!file) return;

    try {
      // Delete from storage bucket
      const { error: storageError } = await supabase
        .storage
        .from('user-documents')
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', file.id);

      if (dbError) throw dbError;

      // Update the files state
      setFiles(files.filter(f => f.id !== file.id));

      // Call onDelete callback if provided
      if (onDelete) onDelete();

    } catch (error) {
      console.error('Error deleting file:', error);
      alert(`Failed to delete ${file.file_name}. Please try again.`);
    } finally {
      setDeleteConfirmation({ isOpen: false, file: null });
    }
  };

  useEffect(() => {
    async function loadFiles() {
      let query = supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false })
        .eq('user_id', userId);

      const { data, error } = await query;

      if (!error && data) {
        const filesWithUrls = await Promise.all(
          data.map(async (file) => {
            const { data: urlData } = await supabase
              .storage
              .from('user-documents')
              .createSignedUrl(file.file_path, 3600);
            
            return {
              ...file,
              signedUrl: urlData?.signedUrl
            };
          })
        );
        
        setFiles(filesWithUrls);
      }
      setLoading(false);
    }

    loadFiles();
  }, [userId, supabase, tableName]);

  if (loading) {
    return <div>Loading files...</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex gap-4 flex-wrap">
        {files.map(file => (
          <div key={file.id} className="relative group">
            <a 
              href={file.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {file.file_type.startsWith('image/') ? (
                <img 
                  src={file.signedUrl}
                  alt={file.file_name}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-sm">{file.file_type.split('/')[1]}</span>
                </div>
              )}
              <span className="text-xs mt-1 block truncate max-w-[80px]">
                {file.file_name}
              </span>
            </a>
            <Button
              onClick={() => handleDeleteFile(file)}
              className="absolute -bottom-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1 h-6 min-h-0 text-xs rounded"
              title="Delete file"
            >
              Delete
            </Button>
          </div>
        ))}
        {files.length === 0 && (
          <div className="text-gray-500">No files uploaded yet</div>
        )}
      </div>
      
      <DeleteConfirmationPopup
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, file: null })}
        onConfirm={handleConfirmDelete}
        fileName={deleteConfirmation.file?.file_name || ''}
        fileType={deleteConfirmation.file?.file_type.startsWith('image/') ? 'image' : 'document'}
      />
    </div>
  );
}