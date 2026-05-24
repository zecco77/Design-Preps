import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { SavedDecks } from './components/SavedDecks';
import { MockInterviewComponent } from './components/MockInterview';
import { QuestionCategory } from './types';
import { COMPANIES, ROLE_TYPES, SENIORITY_LEVELS, INTERVIEW_ROUNDS, INDUSTRY_VERTICALS } from './constants';
import { Layout, LogIn, LogOut, Bookmark, Activity } from 'lucide-react';
import { auth, signInWithGoogle, logout } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function App() {
  const [user] = useAuthState(auth);
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]);
  const [customCompanyUrl, setCustomCompanyUrl] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLE_TYPES[0].name);
  const [selectedLevel, setSelectedLevel] = useState(SENIORITY_LEVELS[2]);
  const [selectedRound, setSelectedRound] = useState(INTERVIEW_ROUNDS[1]);
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRY_VERTICALS[0]);
  
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'generator' | 'saved' | 'practice'>('generator');

  const [practiceDeckCategories, setPracticeDeckCategories] = useState<QuestionCategory[] | null>(null);
  const [practiceDeckId, setPracticeDeckId] = useState<string>('');

  const handleGenerate = async () => {
    const targetCompany = selectedCompany === 'Custom' ? customCompanyUrl : selectedCompany;
    if (selectedCompany === 'Custom' && !customCompanyUrl.trim()) {
       setError("Please enter a company website URL.");
       return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: targetCompany,
          role: selectedRole,
          level: selectedLevel,
          round: selectedRound,
          industry: selectedIndustry,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setActiveView('generator');
    } catch (err) {
      console.error(err);
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePractice = (deckCategories: QuestionCategory[], deckId: string) => {
     setPracticeDeckCategories(deckCategories);
     setPracticeDeckId(deckId);
     setActiveView('practice');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F7] flex-col md:flex-row">
      <Sidebar 
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        customCompanyUrl={customCompanyUrl}
        setCustomCompanyUrl={setCustomCompanyUrl}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedRound={selectedRound}
        setSelectedRound={setSelectedRound}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
      />
      <main className="flex-1 overflow-y-auto bg-white border-l border-black/5 relative">
        <header className="sticky top-0 z-10 bg-white/70 backdrop-blur-xl border-b border-black/5 px-8 py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <Layout className="w-4 h-4 text-white" />
             </div>
             <span className="font-semibold tracking-tight text-lg">DesignPrep</span>
          </div>
          <div className="hidden md:ml-auto md:flex items-center gap-6">
             <button onClick={() => setActiveView('generator')} className={`text-[13px] font-medium transition-colors ${activeView === 'generator' ? 'text-blue-600' : 'text-black/50 hover:text-black'}`}>Generator</button>
             {user && (
               <>
                 <button onClick={() => setActiveView('saved')} className={`text-[13px] font-medium transition-colors flex items-center gap-1.5 ${activeView === 'saved' ? 'text-blue-600' : 'text-black/50 hover:text-black'}`}><Bookmark className="w-4 h-4" /> Saved Decks</button>
                 <button onClick={() => setActiveView('practice')} className={`text-[13px] font-medium transition-colors flex items-center gap-1.5 ${activeView === 'practice' ? 'text-blue-600' : 'text-black/50 hover:text-black'}`}><Activity className="w-4 h-4" /> Mock Interviews</button>
               </>
             )}
             
             {user ? (
                <div className="pl-4 border-l border-black/10 flex items-center gap-3">
                  <span className="text-[13px] font-medium text-[#1D1D1F]">{user.displayName}</span>
                  <button onClick={logout} className="text-black/50 hover:text-red-500 transition-colors" title="Log out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
             ) : (
                <button onClick={signInWithGoogle} className="ml-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors">
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
             )}
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          {activeView === 'generator' && (
            <MainContent 
              company={selectedCompany === 'Custom' ? customCompanyUrl : selectedCompany}
              role={selectedRole}
              level={selectedLevel}
              round={selectedRound}
              industry={selectedIndustry}
              categories={categories}
              isLoading={isLoading}
              error={error}
              onGenerate={handleGenerate}
              onPractice={() => handlePractice(categories, 'temp-generated-deck')}
            />
          )}

          {activeView === 'saved' && (
             <SavedDecks onPractice={(deck) => handlePractice(JSON.parse(deck.categories), deck.id)} />
          )}

          {activeView === 'practice' && (
             practiceDeckCategories ? (
               <MockInterviewComponent categories={practiceDeckCategories} deckId={practiceDeckId} />
             ) : (
               <div className="py-20 flex flex-col items-center justify-center text-center">
                  <Activity className="w-12 h-12 text-black/20 mb-4" />
                  <h3 className="font-semibold text-xl text-[#1D1D1F]">AI Mock Interviews</h3>
                  <p className="text-black/50 mt-2 text-sm">Select a deck in Generator or Saved Decks to practice with Zecco AI Bot.</p>
               </div>
             )
          )}
        </div>
      </main>
    </div>
  );
}
