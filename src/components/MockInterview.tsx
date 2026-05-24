import React, { useState, useEffect, useRef } from 'react';
import { QuestionCategory, InterviewQuestion } from '../types';
import { Bot, User, Send, Loader2, Sparkles, Activity, Mic, Square } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface MockInterviewComponentProps {
  categories: QuestionCategory[];
  deckId: string;
}

export function MockInterviewComponent({ categories, deckId }: MockInterviewComponentProps) {
  const allQuestions = categories.flatMap(c => c.questions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ feedback: string; score: number; improvement: string } | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setAnswer(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Could not start recognition:", e);
      }
    }
  };

  const currentQuestion = allQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Activity className="w-12 h-12 text-black/20 mb-4" />
        <h3 className="font-semibold text-xl text-[#1D1D1F]">Interview Complete!</h3>
        <p className="text-black/50 mt-2 text-sm">You have answered all available questions in this deck.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion.text, answer })
      });

      if (!response.ok) throw new Error("Failed to get feedback");
      const data = await response.json();
      setFeedback(data);

      if (auth.currentUser) {
        await addDoc(collection(db, 'mockInterviews'), {
          userId: auth.currentUser.uid,
          deckId,
          feedback: JSON.stringify(data),
          score: data.score,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error generating feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handeNext = () => {
    setAnswer('');
    setFeedback(null);
    setCurrentQuestionIndex(prev => prev + 1);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Zecco AI Bot</h3>
          <p className="text-xs text-black/50 font-medium">Question {currentQuestionIndex + 1} of {allQuestions.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm">
        <h4 className="font-medium text-lg leading-snug">{currentQuestion.text}</h4>
      </div>

      {!feedback ? (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type or dictate your answer here using the STAR method..."
              className="w-full min-h-[160px] p-4 pb-16 bg-white border border-black/10 rounded-2xl resize-y outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            <div className="absolute bottom-4 left-4">
              <button
                onClick={toggleRecording}
                className={`p-2 rounded-full transition-colors flex items-center justify-center shadow-sm border ${isRecording ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-black/50 hover:text-blue-600 border-black/5 hover:border-blue-100 hover:bg-blue-50'}`}
                title={isRecording ? "Stop Recording" : "Start Voice Typing"}
              >
                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
            {isRecording && (
              <div className="absolute bottom-6 left-16 text-red-500 text-[12px] font-semibold animate-pulse tracking-wide">
                LISTENING...
              </div>
            )}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || !answer.trim()}
            className="self-end bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
           <div className="bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100 flex flex-col gap-6">
              <div className="flex items-center gap-3 border-b border-blue-100 pb-4">
                 <Sparkles className="w-5 h-5 text-blue-600" />
                 <h4 className="font-semibold text-blue-900">Zecco AI Feedback</h4>
                 <div className="ml-auto bg-white px-3 py-1 rounded-full border border-blue-100 font-bold text-blue-700 text-sm shadow-sm">
                   Score: {feedback.score}/10
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <div>
                    <span className="text-[12px] font-semibold text-blue-800/60 block mb-1">ANALYSIS</span>
                    <p className="text-[14px] text-blue-900 leading-relaxed font-medium">{feedback.feedback}</p>
                 </div>
                 <div className="h-px bg-blue-100/50 w-full" />
                 <div>
                    <span className="text-[12px] font-semibold text-blue-800/60 block mb-1">HOW TO IMPROVE</span>
                    <p className="text-[14px] text-blue-900 leading-relaxed">{feedback.improvement}</p>
                 </div>
                 <div className="h-px bg-blue-100/50 w-full" />
                 <div>
                    <span className="text-[12px] font-semibold text-emerald-700/60 block mb-1">IDEAL FRAMEWORK (FOR REFERENCE)</span>
                    <p className="text-[14px] text-emerald-900 leading-relaxed italic border-l-2 border-emerald-500/30 pl-3">"{currentQuestion.sampleAnswer || currentQuestion.idealAnswer}"</p>
                 </div>
              </div>
           </div>
           
           <button 
             onClick={handeNext}
             className="self-end bg-[#1D1D1F] hover:bg-black text-white px-6 py-3 rounded-2xl font-medium transition-all"
           >
             Next Question
           </button>
        </div>
      )}
    </div>
  );
}
