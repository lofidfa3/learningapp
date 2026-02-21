import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  content: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  createdAt: number;
}

interface MindHouseState {
  notes: Note[];
  isLocked: boolean; // Is the pointer locked (FPS mode)
  isEditing: boolean; // Is the user editing a note
  editingNoteId: string | null;

  // Actions
  addNote: (position: [number, number, number], rotation: [number, number, number], content?: string) => string;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;
  setEditing: (isEditing: boolean, noteId?: string | null) => void;
  setLocked: (isLocked: boolean) => void;
}

export const useMindHouseStore = create<MindHouseState>((set) => ({
  notes: [],
  isLocked: false,
  isEditing: false,
  editingNoteId: null,

  addNote: (position, rotation, content = '') => {
    const id = uuidv4();
    set((state) => ({
      notes: [
        ...state.notes,
        {
          id,
          content,
          position,
          rotation,
          color: '#fef3c7', // Default yellow sticky note
          createdAt: Date.now(),
        }
      ]
    }));
    return id;
  },

  updateNote: (id, content) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id ? { ...note, content } : note
    )
  })),

  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id)
  })),

  setEditing: (isEditing, noteId = null) => set({ isEditing, editingNoteId: noteId }),

  setLocked: (isLocked) => set({ isLocked }),
}));
