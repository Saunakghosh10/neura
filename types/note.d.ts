export interface Note {
  id: string;
  title: string;
  content: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  linkedFrom: Array<{
    targetNote: Note;
  }>;
  linkedTo: Array<{
    sourceNote: Note;
  }>;
} 