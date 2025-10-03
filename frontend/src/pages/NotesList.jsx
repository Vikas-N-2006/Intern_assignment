import React, { useEffect, useState, useRef } from 'react';
import { fetchNotes, deleteNote } from '../lib/notesApi';
import NoteEditor from '../components/NoteEditor';

export default function NotesList({ setToast }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [openEditor, setOpenEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const debounceRef = useRef();

  const loadNotes = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetchNotes({ q, limit: 50, sort: 'createdAt:desc' });
      setNotes(res.data.notes || []);
    } catch (err) {
      setToast(err.response?.data?.error || 'Failed to load notes', 'error');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadNotes(query);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete note?')) return;
    try {
      await deleteNote(id);
      setToast('Deleted', 'success');
      setNotes((s) => s.filter(n => n._id !== id));
    } catch (err) {
      setToast(err.response?.data?.error || 'Delete failed', 'error');
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search notes..." className="border p-2 flex-1" />
        <button onClick={() => { setEditingNote(null); setOpenEditor(true); }} className="bg-blue-600 text-white px-3 py-2 rounded">New Note</button>
      </div>

      {loading ? <div>Loading...</div> : (
        <div className="grid md:grid-cols-3 gap-4">
          {notes.map(note => (
            <div key={note._id} className="border rounded p-3 bg-white">
              <h3 className="font-semibold">{note.title}</h3>
              <p className="text-sm mt-2">{note.content?.slice(0,200)}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setEditingNote(note); setOpenEditor(true); }} className="px-2 py-1 bg-yellow-400 rounded">Edit</button>
                <button onClick={() => handleDelete(note._id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {openEditor && (
        <NoteEditor
          note={editingNote}
          onClose={() => { setOpenEditor(false); setEditingNote(null); loadNotes(query); }}
          setToast={setToast}
        />
      )}
    </div>
  );
}
