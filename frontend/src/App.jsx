import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  ArrowRight,
  RefreshCcw,
  Plus,
  X,
  Brain,
  ChevronRight,
  HelpCircle,
  Trophy,
  Clock,
  Award,
  Target
} from 'lucide-react';
import { generateQuestions } from './services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const App = () => {
  // File & Loading State
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Quiz Data State
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  
  // Quiz Session State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of { isCorrect, selectedOption }
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState("");

  // Handle File Drag/Drop/Change
  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") { setFile(droppedFile); setError(null); }
      else setError("Please upload a valid PDF file.");
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Main Action: Generate Quiz
  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateQuestions(file);
      // Reset session state FIRST, then set new quiz data
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowResults(false);
      setScore(0);
      setAnswers([]);
      setStartTime(Date.now());
      // Now set the quiz data (must come LAST so it's not wiped)
      setQuizTitle(data.quizTitle || "UPF Quiz");
      setQuestions(data.questions);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quiz Interaction Logic
  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (!isSubmitted) {
      // Step 1: Submit current answer
      setIsSubmitted(true);
      const isCorrect = selectedOption === Number(currentQuestion.correct_answer_index);
      if (isCorrect) setScore(score + 1);
      
      setAnswers([...answers, {
        isCorrect,
        selectedOption
      }]);
    } else {
      // Step 2: Move to next or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else {
        // Calculate time
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        setTimeSpent(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
        setShowResults(true);
      }
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
    setAnswers([]);
    setStartTime(Date.now());
  };

  const resetAll = () => {
    setFile(null);
    setQuestions([]);
    handleResetQuiz();
  };

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
           <Brain size={14} className="text-indigo-400" />
           <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">UPF AI Instructor</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-2 gradient-text">Quizify PDF</h1>
        <p className="text-slate-500 text-sm">Interactive University-level Assessments</p>
      </motion.div>

      <main className="flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!questions.length ? (
            // UPLOAD VIEW
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-xl">
               <div className={cn(
                  "glass-card rounded-3xl p-10 text-center border-2 border-dashed transition-all duration-300",
                  dragActive ? "border-indigo-500 bg-indigo-500/5" : "border-slate-800"
                )}
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                  {!file ? (
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold mb-1">Select Study Material</h2>
                        <p className="text-slate-500 text-sm">Upload a PDF to generate your personalized quiz.</p>
                      </div>
                      <button onClick={() => fileInputRef.current.click()} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                        Browse Files
                      </button>
                      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleChange} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                        <FileText className="w-8 h-8 text-indigo-400" />
                      </div>
                      <div className="px-4">
                        <h2 className="text-xl font-bold truncate">{file.name}</h2>
                        <p className="text-slate-500 text-sm italic">Ready for processing</p>
                      </div>
                      <div className="flex gap-3 justify-center">
                        <button onClick={resetAll} disabled={loading} className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all">Cancel</button>
                        <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex items-center gap-2">
                          {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <>Start Quiz <ArrowRight size={18} /></>}
                        </button>
                      </div>
                    </div>
                  )}
               </div>
               {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-center text-xs flex items-center justify-center gap-2 shadow-lg"
                >
                  <AlertCircle size={14} className="flex-shrink-0" /> 
                  <span className="font-semibold">{error}</span>
                </motion.div>
               )}
            </motion.div>
          ) : !showResults ? (
            // QUIZ VIEW (STEP-BY-STEP)
            <motion.div key="quiz" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-2xl bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-6 md:p-10 shadow-2xl overflow-hidden relative">
               
               {/* Progress indicator */}
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold text-slate-500">
                     <span className="p-1.5 bg-slate-800 rounded-md text-slate-300">Q{currentQuestionIndex + 1} / {totalQuestions}</span>
                     <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold">PROFESSOR MODE</div>
               </div>
               
               {/* Progress Bar */}
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-8">
                  <motion.div className="h-full bg-indigo-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
               </div>

               {/* Question Title */}
               <h2 className="text-xl md:text-2xl font-bold text-slate-100 mb-8 leading-tight">
                 {currentQuestion.question}
               </h2>

               {/* Options List */}
               <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === currentQuestion.correct_answer_index;
                    
                    let bgClass = "bg-slate-800/40 border-slate-800 text-slate-300";
                    let icon = <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center text-[10px] font-bold">{String.fromCharCode(65 + idx)}</div>;

                    if (isSubmitted) {
                       const actualCorrectIndex = Number(currentQuestion.correct_answer_index);
                       if (idx === actualCorrectIndex) {
                         bgClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/20";
                         icon = <CheckCircle2 size={24} className="text-emerald-500" />;
                       } else if (isSelected) {
                         bgClass = "bg-red-500/20 border-red-500/50 text-red-300 ring-2 ring-red-500/20";
                         icon = <X size={24} className="text-red-500" />;
                       } else {
                         bgClass = "bg-slate-800/20 border-slate-900 text-slate-600 opacity-50";
                       }
                    } else if (isSelected) {
                       bgClass = "bg-indigo-500/20 border-indigo-500/50 text-indigo-300 ring-2 ring-indigo-500/20";
                       icon = <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold font-mono">{String.fromCharCode(65 + idx)}</div>;
                    }

                    return (
                      <button key={idx} disabled={isSubmitted} onClick={() => handleOptionSelect(idx)}
                        className={cn("w-full flex items-center gap-4 p-5 rounded-2xl border transition-all text-left", bgClass)}>
                         {icon}
                         <span className="font-medium">{option}</span>
                      </button>
                    );
                  })}
               </div>

               {/* Explanation / Footer Note */}
               <AnimatePresence>
                 {isSubmitted && (
                   <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className={cn(
                     "p-5 rounded-2xl border mb-8",
                     selectedOption === currentQuestion.correct_answer_index ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
                   )}>
                      <div className="flex gap-3">
                         <HelpCircle size={18} className="text-slate-400 flex-shrink-0 mt-0.5" />
                         <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Explanation</p>
                            <p className="text-sm text-slate-300 leading-relaxed italic">{currentQuestion.explanation}</p>
                         </div>
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               {/* Quiz Navigation */}
               <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                  <button onClick={resetAll} className="text-slate-500 hover:text-slate-300 transition-colors text-sm font-bold flex items-center gap-2">
                    <X size={16} /> QUIT QUIZ
                  </button>
                  <button onClick={handleNext} disabled={selectedOption === null}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                     {isSubmitted ? (currentQuestionIndex === totalQuestions - 1 ? "FINISH RESULTS" : "CONTINUE") : "SUBMIT ANSWER"}
                     <ChevronRight size={18} />
                  </button>
               </div>
            </motion.div>
          ) : (
            // RESULTS SUMMARY
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl flex flex-col items-center">
               <div className="w-20 h-20 bg-amber-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/5">
                 <Trophy className="w-10 h-10 text-amber-500" />
               </div>
               <h2 className="text-3xl font-bold mb-2">Quiz Finished!</h2>
               <p className="text-slate-500 mb-10 text-sm">UPF Academic Performance Review • {timeSpent}</p>

               <div className="grid grid-cols-2 gap-4 w-full mb-10">
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center">
                     <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">Your Score</p>
                     <p className="text-4xl font-black text-emerald-400">{score} / {totalQuestions}</p>
                     <p className="text-[10px] text-emerald-500/60 mt-2 font-mono">{Math.round((score/totalQuestions)*100)}% SUCCESS RATE</p>
                  </div>
                  <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl text-center">
                     <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Accuracy</p>
                     <p className="text-4xl font-black text-indigo-400">{score === totalQuestions ? "100%" : `${Math.round((score/totalQuestions)*100)}%`}</p>
                     <p className="text-[10px] text-indigo-500/60 mt-2 font-mono">GRADE: {score === totalQuestions ? "EXCELLENT" : score >= totalQuestions/2 ? "PASS" : "NEED REVIEW"}</p>
                  </div>
               </div>

               <div className="w-full space-y-3 mb-10 overflow-y-auto max-h-[200px] pr-2 custom-scrollbar">
                  {answers.map((ans, idx) => (
                    <div key={idx} className={cn("flex items-center justify-between p-4 rounded-2xl border", ans.isCorrect ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10")}>
                        <div className="flex items-center gap-3">
                          <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center", ans.isCorrect ? "bg-emerald-500/20" : "bg-red-500/20")}>
                             {ans.isCorrect ? <CheckCircle2 size={14} className="text-emerald-500" /> : <X size={14} className="text-red-500" />}
                          </div>
                          <span className="text-sm font-medium text-slate-300">Question {idx + 1}</span>
                        </div>
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", ans.isCorrect ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10")}>
                          {ans.isCorrect ? "CORRECT" : "WRONG"}
                        </span>
                    </div>
                  ))}
               </div>

               <div className="flex gap-4 w-full pt-6 border-t border-slate-800">
                  <button onClick={handleResetQuiz} className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all flex items-center justify-center gap-2">
                    <RefreshCcw size={18} /> RETAKE
                  </button>
                  <button onClick={resetAll} className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20">
                    <Plus size={18} /> NEW QUIZ
                  </button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-12 py-6 text-center text-slate-700 text-[10px] font-bold uppercase tracking-[0.2em] border-t border-slate-900/50">
        © 2026 Université Privée de Fès • AI Study Assistant
      </footer>
    </div>
  );
};

export default App;
