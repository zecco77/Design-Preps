import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Bookmark, Loader2, Play, Building2 } from 'lucide-react';
import { QuestionCategory } from '../types';
import { getCompanyLogo } from '../utils';

interface SavedDeck {
  id: string;
  company: string;
  role: string;
  level: string;
  createdAt: any;
  categories: string;
}

export function SavedDecks({ onPractice }: { onPractice: (deck: SavedDeck) => void }) {
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDecks() {
      if (!auth.currentUser) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, 'prepDecks'),
          where('userId', '==', auth.currentUser.uid)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedDeck));
        // Sort manually since we might not have an index for orderBy('createdAt', 'desc') along with where
        data.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        setDecks(data);
      } catch (err) {
        console.error("Error loading decks", err);
      } finally {
        setLoading(false);
      }
    }
    loadDecks();
  }, [auth.currentUser]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (decks.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Bookmark className="w-12 h-12 text-black/20 mb-4" />
        <h3 className="font-semibold text-xl text-[#1D1D1F]">No Saved Decks</h3>
        <p className="text-black/50 mt-2 text-sm">You haven't saved any prep decks yet. Go to the Generator to create one!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-semibold text-2xl text-[#1D1D1F]">Your Saved Prep Decks</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map(deck => (
          <div key={deck.id} className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm flex flex-col gap-4">
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-[#F5F5F7] rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                  {getCompanyLogo(deck.company) ? (
                    <>
                      <img 
                        src={getCompanyLogo(deck.company)!} 
                        alt={deck.company} 
                        className="w-8 h-8 object-contain z-10 block" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                          if (nextEl) nextEl.style.display = 'block';
                        }} 
                      />
                      <Building2 className="w-6 h-6 text-black/40 absolute hidden z-0" />
                    </>
                  ) : (
                    <Building2 className="w-6 h-6 text-black/40" />
                  )}
               </div>
               <div className="flex flex-col gap-1">
                 <h4 className="font-semibold text-lg">{deck.company}</h4>
                 <span className="text-sm font-medium text-black/50">{deck.role} • {deck.level}</span>
               </div>
            </div>
            <button 
              onClick={() => onPractice(deck)}
              className="mt-2 bg-[#F5F5F7] hover:bg-black/5 text-black px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" /> Practice with Zecco AI
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
