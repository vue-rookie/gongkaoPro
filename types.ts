export enum ExamMode {
  XING_CE = 'XING_CE', // Administrative Aptitude Test
  SHEN_LUN = 'SHEN_LUN', // Essay Writing
  MIAN_SHI = 'MIAN_SHI'  // Interview
}

export interface Category {
  id: string;
  name: string;
  mode: ExamMode;
  createdAt: number;
  parentId?: string; // Optional: ID of the parent category
}

export interface Session {
  id: string;
  title: string;
  updatedAt: number;
}

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, never store passwords in frontend state! This is for mock only.
  avatar?: string;
  phoneNumber?: string; // Added phone number
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string; // Base64 string for user uploaded images
  isError?: boolean;
  isSystem?: boolean; 
  
  // Study tools
  isBookmarked?: boolean;
  categoryId?: string; // Link to a Category ID
  note?: string; 
  mode?: ExamMode; 
  sessionId?: string; // Linked Session
}

export interface ChatState {
  currentUser: User | null; // Currently logged in user
  messages: Message[];
  categories: Category[]; // List of user defined categories
  sessions: Session[]; // List of chat sessions
  currentSessionId: string; // Active session ID
  isLoading: boolean;
  currentMode: ExamMode;
  showFavoritesOnly: boolean;
}

export interface GeminiConfig {
  model: string;
  systemInstruction: string;
}