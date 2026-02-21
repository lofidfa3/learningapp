'use client';

import { useMindHouseStore } from '@/lib/mindhouse-store';
import { Crosshair } from './Crosshair';
import { useEffect, useState, useRef } from 'react';

export function UI() {
  const { isLocked, isEditing, editingNoteId, notes, updateNote, deleteNote, setEditing, setLocked } = useMindHouseStore();
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && editingNoteId) {
      const note = notes.find(n => n.id === editingNoteId);
      if (note) {
        setContent(note.content);
        // Focus textarea after a short delay to ensure rendering
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    }
  }, [isEditing, editingNoteId, notes]);

  const handleSave = () => {
    if (editingNoteId) {
      updateNote(editingNoteId, content);
      setEditing(false, null);
      setLocked(true); // Return to game
    }
  };

  const handleDelete = () => {
    if (editingNoteId) {
      deleteNote(editingNoteId);
      setEditing(false, null);
      setLocked(true);
    }
  };

  const handleCancel = () => {
    setEditing(false, null);
    setLocked(true);
  };

  // If editing, show the editor
  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-yellow-100 p-6 rounded-lg shadow-xl w-96 max-w-full border-2 border-yellow-300 transform rotate-1">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">Edit Note</h3>
          <textarea
            ref={textareaRef}
            className="w-full h-40 p-3 bg-yellow-50 border border-yellow-200 rounded mb-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none font-handwriting"
            placeholder="Write your thought here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') {
                handleCancel();
              }
            }}
          />
          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition-colors text-sm font-medium"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded shadow-sm transition-colors text-sm font-bold"
              >
                Save
              </button>
            </div>
          </div>
          <p className="text-xs text-yellow-600/60 mt-2 text-center">Press Esc to cancel, Enter to save</p>
        </div>
      </div>
    );
  }

  // If not locked (and not editing), show instructions to start
  if (!isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm text-white pointer-events-none">
        <h1 className="text-4xl font-bold mb-4 tracking-wider">MIND HOUSE</h1>
        <p className="text-lg mb-8 text-gray-200">Your personal 3D Memory Palace</p>

        <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-md max-w-md">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">WASD</span>
              <span>Move around</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">MOUSE</span>
              <span>Look around</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">CLICK</span>
              <span>Place a note on any surface</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">ESC</span>
              <span>Release cursor / Pause</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 animate-pulse text-yellow-300 font-medium">Click anywhere to enter</p>
      </div>
    );
  }

  return (
    <>
      <Crosshair />
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-black/40 backdrop-blur text-white/80 px-3 py-1.5 rounded text-xs font-mono pointer-events-none">
          Notes: {notes.length}
        </div>
      </div>
    </>
  );
}
