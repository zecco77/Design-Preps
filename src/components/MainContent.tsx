import React, { useState } from 'react';
import { QuestionCategory } from '../types';
import { Play, Download, Bookmark, Building2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { ROLE_TYPES } from '../constants';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getCompanyLogo } from '../utils';

interface MainContentProps {
  company: string;
  role: string;
  level: string;
  round: string;
  industry: string;
  categories: QuestionCategory[];
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onPractice: () => void;
}

export function MainContent({ company, role, level, round, industry, categories, isLoading, error, onGenerate, onPractice }: MainContentProps) {
  const [activeTab, setActiveTab] = useState<string>('');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');

  React.useEffect(() => {
    if (categories.length > 0 && !activeTab) {
      setActiveTab(categories[0].name);
    } else if (categories.length > 0 && activeTab) {
      const exists = categories.find(c => c.name === activeTab);
      if (!exists) setActiveTab(categories[0].name);
    }
  }, [categories, activeTab]);

  const activeCategory = categories.find(c => c.name === activeTab);
  
  const selectedRoleData = ROLE_TYPES.find(r => r.name === role);

  const handleSaveDeck = async () => {
     if (!auth.currentUser) {
        alert("Please sign in to save decks.");
        return;
     }

     setSavingState('saving');
     try {
       await addDoc(collection(db, 'prepDecks'), {
          userId: auth.currentUser.uid,
          company,
          role,
          level,
          round,
          industry,
          categories: JSON.stringify(categories),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
       });
       setSavingState('saved');
       setTimeout(() => setSavingState('idle'), 3000);
     } catch (err) {
       console.error("Error saving deck", err);
       alert("Failed to save deck. Ensure you're signed in and try again.");
       setSavingState('idle');
     }
  };

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Company Header Card */}
      <section className="bg-white rounded-3xl border border-black/5 p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex items-start justify-between flex-col md:flex-row gap-6 md:gap-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
               {getCompanyLogo(company) ? (
                 <>
                   <img 
                     src={getCompanyLogo(company)!} 
                     alt={company} 
                     className="w-10 h-10 object-contain z-10 block" 
                     onError={(e) => {
                       e.currentTarget.style.display = 'none';
                       const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                       if (nextEl) nextEl.style.display = 'block';
                     }} 
                   />
                   <Building2 className="w-8 h-8 text-black/40 absolute hidden z-0" />
                 </>
               ) : (
                 <Building2 className="w-8 h-8 text-black/40" />
               )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="font-semibold text-3xl tracking-tight text-[#1D1D1F]">{company}</h1>
              <div className="flex items-center gap-3 text-sm text-black/50">
                <span className="font-medium text-[#1D1D1F] bg-[#F5F5F7] px-2.5 py-1 rounded-md">{role}</span>
                <span>•</span>
                <span>{level} Target</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? 'Generating Prep...' : 'Generate Questions'}</span>
          </button>
        </div>
        
        {selectedRoleData && (
          <div className="mt-8 pt-8 border-t border-black/5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <h4 className="text-[12px] font-semibold text-black/40 mb-1">KEY COMPETENCIES TESTED</h4>
               <p className="text-[14px] text-black/70 font-medium">{selectedRoleData.skills}</p>
            </div>
            <div>
               <h4 className="text-[12px] font-semibold text-black/40 mb-1">EXPECTED DEPTH</h4>
               <p className="text-[14px] text-black/70 font-medium">{level} level context usually requires demonstrated impact and leadership.</p>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {categories.length > 0 && !isLoading && (
        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xl text-[#1D1D1F]">Tailored Prep Deck</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveDeck} 
                disabled={savingState !== 'idle'} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors text-[13px] font-medium ${savingState === 'saved' ? 'bg-emerald-50 text-emerald-600' : 'text-black/50 hover:text-blue-600 hover:bg-blue-50'}`}
                title="Save to Study Deck"
              >
                {savingState === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                {savingState === 'saving' ? 'Saving...' : savingState === 'saved' ? 'Saved' : 'Save'}
              </button>
              <button className="text-black/50 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-colors" title="Export as PDF (coming soon)">
                <Download className="w-5 h-5" />
              </button>
              <button onClick={onPractice} className="text-black/50 hover:text-blue-600 p-2 rounded-xl hover:bg-blue-50 transition-colors" title="Practice Mode">
                <Play className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b border-black/5 pb-[1px]">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveTab(cat.name)}
                className={`px-4 py-2 text-[14px] font-medium border-b-2 transition-colors duration-200 ease-in-out ${
                  activeTab === cat.name 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-black/50 hover:text-black/80 hover:border-black/20'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {activeCategory?.questions.map((q, idx) => (
              <div key={idx} className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-5 group">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-[#1D1D1F] leading-snug text-[17px]">{q.text}</h4>
                  <span className={`shrink-0 text-[12px] font-semibold px-2.5 py-1 rounded-full tracking-wide ${
                    q.difficulty === 'Hard' ? 'bg-red-50 text-red-600' :
                    q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                    'bg-emerald-50 text-emerald-600'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>
                
                <div className="bg-[#F5F5F7]/50 rounded-2xl p-5 md:p-6 border border-black/5">
                  <div className="flex flex-col gap-4">
                    <div>
                      <span className="text-[12px] font-semibold text-black/40 block mb-1.5">WHAT THEY ARE TESTING</span>
                      <p className="text-[14px] text-black/70 leading-relaxed font-medium">{q.testing}</p>
                    </div>
                    <div className="h-px bg-black/5 w-full" />
                    <div>
                      <span className="text-[12px] font-semibold text-black/40 block mb-1.5">IDEAL ANSWER FRAMEWORK (STAR)</span>
                      <p className="text-[14px] text-black/80 leading-relaxed">{q.idealAnswer}</p>
                    </div>
                    {q.sampleAnswer && (
                      <>
                        <div className="h-px bg-black/5 w-full" />
                        <div>
                          <span className="text-[12px] font-semibold text-blue-600/80 block mb-1.5">SAMPLE ANSWER</span>
                          <p className="text-[14px] text-[#1D1D1F] leading-relaxed italic border-l-2 border-blue-600/30 pl-3">"{q.sampleAnswer}"</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {categories.length === 0 && !isLoading && !error && (
        <div className="py-24 flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 bg-[#F5F5F7] rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-8 h-8 text-black/30" />
          </div>
          <h3 className="font-semibold text-xl text-[#1D1D1F] mb-2">Ready to generate your interview</h3>
          <p className="text-[14px] text-black/50 max-w-sm">Select your target company, role, and level in the sidebar, then click "Generate Questions" to create your tailored study plan.</p>
        </div>
      )}
    </div>
  );
}
