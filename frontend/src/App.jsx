import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen, 
  ArrowRight,
  ChevronRight,
  RefreshCcw,
  Plus
} from 'lucide-react';
import { generateQuestions } from './services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIndex: selectedOption }
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSelectOption = (qIdx, option) => {
    if (userAnswers[qIdx]) return; // Already answered
    setUserAnswers(prev => ({ ...prev, [qIdx]: option }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a valid PDF file.");
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateQuestions(file);
      setQuestions(data.questions);
      setUserAnswers({});
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setQuestions([]);
    setUserAnswers({});
    setError(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20">
          <BookOpen className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
          Quizify PDF
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Transform your study materials into interactive questions instantly using Gemini AI.
        </p>
      </motion.div>

      <main>
        <AnimatePresence mode="wait">
          {questions.length === 0 ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto"
            >
              <div
                className={cn(
                  "glass-card rounded-3xl p-8 md:p-12 text-center relative transition-all duration-300",
                  dragActive ? "border-indigo-500 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10" : "border-slate-800"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!file ? (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto border border-slate-700">
                      <Upload className="w-10 h-10 text-slate-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Upload your PDF</h2>
                      <p className="text-slate-500 text-sm">Drag and drop your file here, or click to browse</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleChange}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto border border-indigo-500/20">
                      <FileText className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold mb-1 truncate px-4">{file.name}</h2>
                      <p className="text-slate-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={reset}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            Generate Questions
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold">Generated Questions</h2>
                  <p className="text-slate-400">We found {questions.length} questions from your PDF</p>
                </div>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all font-medium"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Try Another PDF
                </button>
              </div>

              <div className="grid gap-6">
                {questions.map((q, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        {idx + 1}
                      </div>
                      <div className="space-y-6 flex-1">
                        <h3 className="text-xl font-medium text-slate-100 leading-relaxed">
                          {q.question}
                        </h3>
                        
                        <div className="grid gap-3 mt-4">
                          {q.options && q.options.map((option, optIdx) => {
                            const isSelected = userAnswers[idx] === option;
                            const isCorrect = option === q.answer;
                            const hasAnswered = !!userAnswers[idx];
                            
                            let stateClasses = "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 cursor-pointer";
                            
                            if (hasAnswered) {
                              if (isCorrect) {
                                stateClasses = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                              } else if (isSelected) {
                                stateClasses = "bg-red-500/20 border-red-500/50 text-red-300";
                              } else {
                                stateClasses = "bg-slate-800/20 border-slate-800 text-slate-600 opacity-50";
                              }
                            }

                            return (
                              <button 
                                key={optIdx}
                                disabled={hasAnswered}
                                onClick={() => handleSelectOption(idx, option)}
                                className={cn(
                                  "p-4 rounded-xl border transition-all text-left flex items-center justify-between group/opt",
                                  stateClasses
                                )}
                              >
                                <span>{option}</span>
                                {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                {hasAnswered && isSelected && !isCorrect && <AlertCircle className="w-5 h-5 text-red-500" />}
                              </button>
                            );
                          })}
                        </div>

                        {!q.options && q.answer && (
                           <div className="mt-4 p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Correct Answer
                              </div>
                              <p className="text-slate-300 italic">
                                {q.answer}
                              </p>
                           </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-center pt-8 pb-12">
                 <button
                   onClick={reset}
                   className="inline-flex items-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-indigo-600/20"
                 >
                   <Plus className="w-5 h-5" />
                   Generate More
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 text-center text-slate-600 text-sm border-t border-slate-900">
        <p>© 2026 Quizify PDF AI. All study materials processed securely in memory.</p>
      </footer>
    </div>
  );
};

export default App;
