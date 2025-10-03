import React from 'react';
import { useForm } from 'react-hook-form';
import { createNote, updateNote } from '../lib/notesApi';

export default function NoteEditor({ note, onClose, setToast }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: note?.title || '',
      content: note?.content || '',
      tags: (note?.tags || []).join(', ')
    }
  });

  const onSubmit = async (data) => {
    try {
      const payload = { title: data.title, content: data.content, tags: data.tags.split(',').map(t=>t.trim()).filter(Boolean) };
      if (note) {
        await updateNote(note._id, payload);
        setToast('Note updated', 'success');
      } else {
        await createNote(payload);
        setToast('Note created', 'success');
      }
      onClose();
    } catch (err) {
      setToast(err.response?.data?.error || 'Save failed', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-xl">
        <h3 className="text-xl mb-3">{note ? 'Edit Note' : 'New Note'}</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('title', { required: true })} placeholder="Title" className="w-full p-2 border mb-2" />
          {errors.title && <div className="text-red-500">Title required</div>}

          <textarea {...register('content')} rows="6" placeholder="Content" className="w-full p-2 border mb-2" />

          <input {...register('tags')} placeholder="tags comma separated" className="w-full p-2 border mb-2" />

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
