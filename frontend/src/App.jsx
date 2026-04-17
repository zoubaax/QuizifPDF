import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCcw,
  X,
  Brain,
  ChevronRight,
  HelpCircle,
  Trophy,
  Clock,
  Target,
  Sparkles,
  User,
  Lightbulb,
  ChevronLeft,
  Menu,
  Zap,
  BarChart3,
  LogOut,
  Share2,
  Bookmark,
  Info,
  Globe,
  Mail,
  Link,
  SendHorizontal,
  Sun,
  Moon,
  CheckCircle,
  ShieldAlert
} from 'lucide-react';
import { generateQuestions } from './services/api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import upfLogo from './assets/upf-logo.png';
import uitLogo from './assets/uit-logo.png';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const App = () => {
  // Common UI State
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyse...");
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  // User State (simulated)
  const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes
  const [userName, setUserName] = useState("Ahmed Benali");

  // Navigation & UI state
  const [mode, setMode] = useState('quiz'); // Always 'quiz' for now
  const theme = 'dark';
  const [fontSize, setFontSize] = useState('medium');

  // --- PDF QUIZ STATE ---
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState("");
  const [quizHistory, setQuizHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState([]);
  const [quizSettings, setQuizSettings] = useState({
    shuffleQuestions: false,
    shuffleOptions: false,
    timeLimit: null,
    showExplanations: true,
    passScore: 70
  });



  // Force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Dynamic Loading Messages
  useEffect(() => {
    let interval;
    if (loading) {
      const messages = [
        "Analyse du document...",
        "Extraction du texte...",
        "Identification des concepts clés...",
        "Génération des questions...",
        "Optimisation pédagogique...",
        "Finalisation du quiz..."
      ];
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % messages.length;
        setLoadingMessage(messages[i]);
      }, 2000);
    } else {
      setLoadingMessage("Analyse du document...");
    }
    return () => clearInterval(interval);
  }, [loading]);



  // --- SAVED ITEMS ---
  const [savedItems, setSavedItems] = useState({
    quizzes: []
  });

  // --- ANALYTICS ---
  const [analytics, setAnalytics] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    favoriteSubjects: []
  });

  // --- PDF HANDLERS ---
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
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
        showNotification("Fichier chargé avec succès", "success");
      }
      else setError("Veuillez télécharger un fichier PDF valide.");
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      showNotification("Fichier sélectionné", "success");
    }
  };

  const handleSampleSelect = async (fileName, displayName) => {
    try {
      setLoading(true);
      const response = await fetch(`/sources/${fileName}`);
      if (!response.ok) throw new Error("File not found");
      const blob = await response.blob();
      const sampleFile = new File([blob], fileName, { type: 'application/pdf' });
      setFile(sampleFile);
      showNotification(`Document "${displayName}" chargé`, "success");
    } catch (err) {
      showNotification("Erreur lors du chargement - Vérifiez si le fichier existe dans /public/sources/", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleQuizSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await generateQuestions(file);
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowResults(false);
      setScore(0);
      setAnswers([]);
      setStartTime(Date.now());
      setQuizTitle(data.quizTitle || "Quiz UPF");

      let processedQuestions = data.questions;
      if (quizSettings.shuffleQuestions) {
        processedQuestions = [...processedQuestions].sort(() => Math.random() - 0.5);
      }
      if (quizSettings.shuffleOptions) {
        processedQuestions = processedQuestions.map(q => ({
          ...q,
          options: [...q.options].sort(() => Math.random() - 0.5),
          correct_answer_index: 0 // Would need to track original index
        }));
      }

      setQuestions(processedQuestions);
      showNotification("Quiz généré avec succès", "success");
    } catch (err) {
      setError(err.response?.data?.error || "Échec de la génération des questions. Veuillez réessayer.");
      showNotification("Erreur lors de la génération", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!isSubmitted) {
      setIsSubmitted(true);
      const isCorrect = selectedOption === Number(currentQuestion.correct_answer_index);
      if (isCorrect) setScore(score + 1);
      setAnswers([...answers, { isCorrect, selectedOption, question: currentQuestion }]);
    } else {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
      } else {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        const mins = Math.floor(duration / 60);
        const secs = duration % 60;
        setTimeSpent(mins > 0 ? `${mins}m ${secs}s` : `${secs}s`);
        setShowResults(true);

        // Save to history
        const quizResult = {
          id: Date.now(),
          title: quizTitle,
          score: score + (selectedOption === Number(currentQuestion.correct_answer_index) ? 1 : 0),
          totalQuestions: questions.length,
          timeSpent: mins > 0 ? `${mins}m ${secs}s` : `${secs}s`,
          date: new Date().toISOString(),
          answers: [...answers, { isCorrect: selectedOption === Number(currentQuestion.correct_answer_index), selectedOption }]
        };
        setQuizHistory([quizResult, ...quizHistory]);

        // Update analytics
        setAnalytics(prev => ({
          ...prev,
          totalQuizzes: prev.totalQuizzes + 1,
          averageScore: (prev.averageScore * prev.totalQuizzes + (score + (selectedOption === Number(currentQuestion.correct_answer_index) ? 1 : 0)) / questions.length * 100) / (prev.totalQuizzes + 1),
          totalTimeSpent: prev.totalTimeSpent + duration
        }));

        showNotification("Quiz terminé !", "success");
      }
    }
  };

  const saveQuiz = () => {
    const quizToSave = {
      id: Date.now(),
      title: quizTitle,
      questions: questions,
      score: score,
      totalQuestions: questions.length,
      date: new Date().toISOString()
    };
    setSavedQuizzes([quizToSave, ...savedQuizzes]);
    showNotification("Quiz sauvegardé", "success");
  };

  const shareResult = async () => {
    const resultText = `J'ai obtenu ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%) au quiz "${quizTitle}" sur Quizify UPF!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mon résultat Quizify',
          text: resultText,
        });
      } catch (err) {
        navigator.clipboard.writeText(resultText);
        showNotification("Résultat copié dans le presse-papier", "success");
      }
    } else {
      navigator.clipboard.writeText(resultText);
      showNotification("Résultat copié dans le presse-papier", "success");
    }
  };



  // --- NAVIGATION ---
  const goHome = () => {
    setQuestions([]);
    setFile(null);
    setShowResults(false);
    setError(null);
    setLoading(false);
    setShowHistory(false);
  };

  // --- RENDER HELPERS ---
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;



  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      theme === 'dark' ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 via-white to-slate-50"
    )}>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[100] font-bold text-xs flex items-center gap-3 border backdrop-blur-md",
              notification.type === 'error' ? "bg-red-500/90 border-red-400 text-white" : "bg-emerald-500/90 border-emerald-400 text-white"
            )}
          >
            {notification.type === 'error' ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="transition-all duration-300">
        <div className="min-h-screen py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col">
          {/* Global Header */}
          <header className="flex items-center justify-between gap-4 mb-8 sm:mb-12 glass-card p-4 sm:p-6 rounded-3xl sm:rounded-[2rem]">
            <button onClick={goHome} className="flex items-center gap-2 sm:gap-4 group transition-transform hover:scale-[1.02] active:scale-95">
              <div className="flex items-center gap-2 sm:gap-3 px-1">
                <img src={upfLogo} alt="UPF Logo" className="h-7 sm:h-10 w-auto object-contain" />
                <div className="w-[1px] h-5 sm:h-8 bg-slate-200/50"></div>
                <img src={uitLogo} alt="UIT Logo" className="h-7 sm:h-10 w-auto object-contain" />
              </div>
              <div className="text-left hidden xs:block border-l border-slate-200 pl-3 sm:pl-4 ml-1">
                <h1 className="text-sm sm:text-xl font-black tracking-tight leading-none uppercase gradient-text">Quizify</h1>
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">Academic AI</span>
              </div>
            </button>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-50/50 dark:bg-indigo-900/30 border border-indigo-100/50 dark:border-indigo-800/50 rounded-xl sm:rounded-2xl flex items-center gap-2 backdrop-blur-sm">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                <span className="text-[8px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">LIVE</span>
              </div>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center w-full">
            <AnimatePresence mode="wait">



              {/* QUIZ MODE */}
              {mode === 'quiz' && (
                <motion.div key="quiz-container" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-4xl mx-auto px-2 sm:px-0">
                  {!questions.length ? (
                    <div className="w-full max-w-xl mx-auto">
                      {/* Sample Selection */}
                      {!file && (
                        <div className="mb-8">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 pl-1">
                            🚀 Documents de l'UPF IT Club :
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {[
                              { id: 's1', name: 'alnthria-oaltjrba-8.pdf', label: 'Al-Nathria (Théorie & Exp.)', color: 'emerald' },
                              { id: 's2', name: 'seance-1-limites-et-derivation-rappel-1.pdf', label: 'Maths: Limites & Dérivation', color: 'blue' },
                              { id: 's3', name: 'seance-15-transformations-liees-a-des-reactions-acide-base-7.pdf', label: 'Chimie: Acide-Base', color: 'indigo' },
                            ].map((sample) => (
                              <button
                                key={sample.id}
                                onClick={() => handleSampleSelect(sample.name, sample.label)}
                                className={cn(
                                  "flex items-center gap-4 p-4 rounded-2xl border text-left transition-all group relative overflow-hidden",
                                  theme === 'dark'
                                    ? "bg-slate-800/40 border-slate-700 hover:border-indigo-500/50"
                                    : "bg-white border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-md"
                                )}
                              >
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                  theme === 'dark' ? "bg-slate-700/50" : "bg-slate-50"
                                )}>
                                  <FileText size={20} className="text-indigo-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-200">{sample.label}</p>
                                    <span className="text-[8px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">PDF</span>
                                  </div>
                                  <p className="text-[9px] text-slate-400 mt-1">Générer un quiz instantanément</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-4 my-8">
                            <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800"></div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">OU</span>
                            <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800"></div>
                          </div>
                        </div>
                      )}

                      {/* Quiz Settings Bar */}
                      <div className="mb-4 flex justify-end">
                        <button
                          onClick={() => setQuizSettings(prev => ({ ...prev, shuffleQuestions: !prev.shuffleQuestions }))}
                          className={cn(
                            "text-[8px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all flex items-center gap-1.5 outline-none",
                            quizSettings.shuffleQuestions
                              ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                              : "bg-white/50 dark:bg-slate-800/50 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300"
                          )}
                        >
                          <RefreshCcw size={10} /> {quizSettings.shuffleQuestions ? "Mélange Actif" : "Mélanger"}
                        </button>
                      </div>

                      <div className={cn(
                        "rounded-[2.5rem] p-8 sm:p-12 text-center border-2 border-dashed transition-all duration-300",
                        dragActive
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : theme === 'dark'
                            ? "border-slate-700 bg-slate-800/50"
                            : "border-slate-200 bg-white"
                      )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}>
                        {!file ? (
                          <div className="space-y-8">
                            <div className={cn(
                              "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto shadow-sm ring-1 relative overflow-hidden",
                              theme === 'dark' ? "bg-slate-700/50 ring-slate-600" : "bg-white ring-slate-100"
                            )}>
                              <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div>
                              <h2 className="text-xl sm:text-2xl font-black mb-1 sm:mb-2 italic text-slate-900 dark:text-white">Charger le PDF</h2>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px] sm:text-sm">Déposez votre support de cours ici.</p>
                            </div>
                            <button
                              onClick={() => fileInputRef.current.click()}
                              className="w-full sm:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                            >
                              Parcourir les fichiers
                            </button>
                            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf" onChange={handleChange} />
                          </div>
                        ) : (
                          <div className="space-y-8">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-800">
                              <FileText size={40} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h2 className="text-xl font-black truncate max-w-xs mx-auto mb-1 text-slate-900 dark:text-white">{file.name}</h2>
                              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Prêt pour l'Analyse</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              <button
                                onClick={goHome}
                                className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all"
                              >
                                Annuler
                              </button>
                              <button
                                onClick={handleQuizSubmit}
                                disabled={loading}
                                className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 min-w-[200px]"
                              >
                                {loading ? (
                                  <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="animate-pulse">{loadingMessage}</span>
                                  </>
                                ) : (
                                  <>Générer l'Évaluation <ArrowRight size={16} /></>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quiz History Preview */}
                      {quizHistory.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={12} /> Derniers quiz
                          </h3>
                          <div className="space-y-2">
                            {quizHistory.slice(0, 3).map(quiz => (
                              <div key={quiz.id} className={cn(
                                "p-3 rounded-xl flex items-center justify-between text-xs",
                                theme === 'dark' ? "bg-slate-800/50" : "bg-slate-50"
                              )}>
                                <div>
                                  <p className="font-bold">{quiz.title}</p>
                                  <p className="text-[9px] text-slate-400">{quiz.date.slice(0, 10)}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-emerald-600">{quiz.score}/{quiz.totalQuestions}</p>
                                  <p className="text-[9px] text-slate-400">{quiz.timeSpent}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !showResults ? (
                    <div className={cn(
                      "rounded-[2.5rem] border p-6 sm:p-12 shadow-xl relative overflow-hidden",
                      theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-white/80 border-slate-200"
                    )}>
                      {/* Progress Bar */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-slate-100 dark:bg-slate-700">
                        <motion.div
                          className="h-full bg-indigo-600"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pt-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                            Question {currentQuestionIndex + 1} sur {totalQuestions}
                          </span>
                          <div className="h-1 w-12 bg-indigo-600 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          {quizSettings.timeLimit && (
                            <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 rounded-full text-[9px] font-bold tracking-widest uppercase flex items-center gap-1">
                              <Clock size={10} /> Chrono
                            </div>
                          )}
                          <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-full text-[9px] font-bold tracking-widest uppercase">
                            Mode Académique UPF
                          </div>
                        </div>
                      </div>

                      {/* Question */}
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-10 leading-[1.3] italic">
                        {currentQuestion.question}
                      </h2>

                      {/* Options */}
                      <div className="space-y-4 mb-10">
                        {currentQuestion.options.map((option, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrect = idx === Number(currentQuestion.correct_answer_index);
                          return (
                            <button
                              key={idx}
                              disabled={isSubmitted}
                              onClick={() => handleOptionSelect(idx)}
                              className={cn(
                                "w-full flex items-center gap-4 p-5 sm:p-6 rounded-2xl border transition-all text-left group",
                                isSubmitted
                                  ? (isCorrect
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/20"
                                    : isSelected
                                      ? "bg-red-50 dark:bg-red-900/20 border-red-500/20"
                                      : "opacity-30 border-slate-100 dark:border-slate-800")
                                  : isSelected
                                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500/30 ring-2 ring-indigo-500/10 scale-[1.01]"
                                    : cn(
                                      theme === 'dark'
                                        ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                                        : "bg-white border-slate-200 hover:border-slate-300"
                                    )
                              )}>
                              <div className={cn(
                                "w-8 h-8 rounded-xl border flex items-center justify-center text-[11px] font-black shrink-0 transition-colors shadow-sm",
                                isSelected
                                  ? "bg-indigo-600 border-indigo-500 text-white"
                                  : theme === 'dark'
                                    ? "bg-slate-700 border-slate-600 text-slate-400"
                                    : "bg-slate-50 border-slate-200 text-slate-400"
                              )}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className={cn(
                                "font-bold text-sm sm:text-base",
                                isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                              )}>
                                {option}
                              </span>
                              {isSubmitted && isCorrect && (
                                <CheckCircle2 size={18} className="ml-auto text-emerald-500" />
                              )}
                              {isSubmitted && isSelected && !isCorrect && (
                                <X size={18} className="ml-auto text-red-500" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <AnimatePresence>
                        {isSubmitted && quizSettings.showExplanations && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "p-6 rounded-2xl border mb-10 text-sm leading-relaxed relative",
                              theme === 'dark'
                                ? "bg-slate-700/50 border-slate-600 text-slate-300"
                                : "bg-slate-50 border-slate-100 text-slate-600"
                            )}
                          >
                            <div className="absolute top-0 left-6 -translate-y-1/2 px-2 bg-white dark:bg-slate-800 text-[9px] font-black text-indigo-600 uppercase tracking-widest border border-slate-100 dark:border-slate-700 rounded-full">
                              Explication
                            </div>
                            <HelpCircle className="inline-block mr-2 mb-1 text-indigo-600" size={14} />
                            {currentQuestion.explanation}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex gap-3">
                          <button
                            onClick={goHome}
                            className="text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest"
                          >
                            Abandonner
                          </button>
                          <button
                            onClick={saveQuiz}
                            className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest flex items-center gap-1"
                          >
                            <Bookmark size={10} /> Sauvegarder
                          </button>
                        </div>
                        <button
                          onClick={handleNext}
                          disabled={selectedOption === null}
                          className="px-8 sm:px-12 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-indigo-600/20 active:scale-95"
                        >
                          {isSubmitted
                            ? (currentQuestionIndex === totalQuestions - 1 ? "Voir les Résultats" : "Continuer")
                            : "Valider la Réponse"}
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "rounded-[2.5rem] border p-8 sm:p-14 shadow-2xl flex flex-col items-center",
                      theme === 'dark' ? "bg-slate-800/50 border-slate-700" : "bg-white"
                    )}>
                      {/* Results */}
                      <div className="w-24 h-24 bg-amber-50 dark:bg-amber-900/30 rounded-[2rem] flex items-center justify-center mb-8 border border-amber-100 dark:border-amber-800">
                        <Trophy className="w-12 h-12 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-black mb-4 text-center italic text-slate-900 dark:text-white">Évaluation Terminée</h2>
                      <p className="text-slate-500 dark:text-slate-400 mb-12 text-sm uppercase tracking-widest font-black">
                        Rapport de performance UPF • {timeSpent}
                      </p>

                      {/* Score Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-12">
                        <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-[2rem] text-center">
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Score</p>
                          <p className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                            {score}<span className="text-xl text-slate-300 not-italic ml-1">/{totalQuestions}</span>
                          </p>
                        </div>
                        <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-[2rem] text-center">
                          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Taux de Réussite</p>
                          <p className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                            {Math.round((score / totalQuestions) * 100)}<span className="text-xl text-slate-300 not-italic ml-1">%</span>
                          </p>
                        </div>
                        <div className="p-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-[2rem] text-center">
                          <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Temps</p>
                          <p className="text-5xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                            {timeSpent.split(' ')[0]}<span className="text-xl text-slate-300 not-italic ml-1">{timeSpent.includes('m') ? 'min' : 's'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Performance Message */}
                      <div className="text-center mb-12">
                        <p className={cn(
                          "text-lg font-bold mb-2",
                          (score / totalQuestions) >= 0.7 ? "text-emerald-600" :
                            (score / totalQuestions) >= 0.5 ? "text-amber-600" : "text-red-600"
                        )}>
                          {(score / totalQuestions) >= 0.7 ? "Excellent travail !" :
                            (score / totalQuestions) >= 0.5 ? "Bon travail, mais peut mieux faire" :
                              "Besoin de révision supplémentaire"}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {(score / totalQuestions) >= 0.7 ? "Vous maîtrisez parfaitement ce sujet." :
                            (score / totalQuestions) >= 0.5 ? "Continuez à vous entraîner pour exceller." :
                              "Nous vous recommandons de revoir le cours."}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-4 w-full pt-10 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={shareResult}
                          className="flex-1 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                        >
                          <Share2 size={14} /> Partager
                        </button>
                        <button
                          onClick={goHome}
                          className="flex-1 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-slate-300 transition-all"
                        >
                          Analyser un Autre PDF
                        </button>
                        <button
                          onClick={goHome}
                          className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
                        >
                          Nouveau Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}



            </AnimatePresence>
          </main>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-3xl text-xs font-black flex items-center justify-center gap-3 shadow-md"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          {/* Footer */}
          <footer className="mt-20 py-10 text-center border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all mb-8">
              <img src={upfLogo} alt="UPF" className="h-8 w-auto" />
              <img src={uitLogo} alt="UIT" className="h-8 w-auto" />
            </div>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">
              Suite Universitaire • Système d'intégrité académique AI v2.0
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Globe size={14} />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Mail size={14} />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                <Link size={14} />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;