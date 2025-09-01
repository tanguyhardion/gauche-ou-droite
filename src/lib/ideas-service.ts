import { collection, getDocs, query, limit, where, type DocumentData } from 'firebase/firestore';
import { db } from './firebase';

export interface Idea {
  id: string;
  text: string;
  category?: string;
}

const SEEN_IDEAS_KEY = 'gauche-ou-droite-seen-ideas';

// Hash function for ideas using native Web Crypto API
async function hashIdea(ideaId: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ideaId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.slice(0, 16); // Use first 16 characters for shorter hash
}

// Get seen ideas from localStorage
export function getSeenIdeas(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const stored = localStorage.getItem(SEEN_IDEAS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

// Add idea to seen list
export async function markIdeaAsSeen(ideaId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const seenIdeas = getSeenIdeas();
  const hashedId = await hashIdea(ideaId);
  seenIdeas.add(hashedId);
  
  try {
    localStorage.setItem(SEEN_IDEAS_KEY, JSON.stringify([...seenIdeas]));
  } catch (error) {
    console.error('Failed to save seen ideas:', error);
  }
}

// Check if idea has been seen
export async function hasSeenIdea(ideaId: string): Promise<boolean> {
  const seenIdeas = getSeenIdeas();
  const hashedId = await hashIdea(ideaId);
  return seenIdeas.has(hashedId);
}

// Clear seen ideas (for reset functionality)
export function clearSeenIdeas(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SEEN_IDEAS_KEY);
  } catch (error) {
    console.error('Failed to clear seen ideas:', error);
  }
}

// Fetch a random unseen idea from Firestore
export async function fetchRandomIdea(): Promise<Idea | null> {
  try {
    // First, get all ideas
    const ideasRef = collection(db, 'ideas');
    const snapshot = await getDocs(ideasRef);
    
    if (snapshot.empty) {
      console.warn('No ideas found in Firestore');
      return null;
    }

    // Filter out seen ideas
    const allIdeas: Idea[] = [];
    const seenChecks = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const idea: Idea = {
          id: doc.id,
          text: data.text || data.content || '', // Handle different possible field names
          category: data.category,
        };
        
        const isSeen = await hasSeenIdea(doc.id);
        return { idea, isSeen };
      })
    );

    // Collect unseen ideas
    seenChecks.forEach(({ idea, isSeen }) => {
      if (!isSeen) {
        allIdeas.push(idea);
      }
    });

    // If all ideas have been seen, optionally reset or return null
    if (allIdeas.length === 0) {
      console.warn('All ideas have been seen. Consider clearing seen ideas.');
      return null;
    }

    // Return a random unseen idea
    const randomIndex = Math.floor(Math.random() * allIdeas.length);
    return allIdeas[randomIndex];
  } catch (error) {
    console.error('Error fetching random idea:', error);
    return null;
  }
}
