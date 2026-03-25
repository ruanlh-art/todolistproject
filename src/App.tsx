import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  parseISO,
  setYear,
  setMonth
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trophy, 
  Info,
  Calendar as CalendarIcon,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { validateTodoMeaning } from './services/gemini';
import { Todo } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('todo_user_name') || '';
  });
  const [tempName, setTempName] = useState('');
  
  const storageKey = useMemo(() => `todos_2026_${userName}`, [userName]);

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem(`todos_2026_${localStorage.getItem('todo_user_name') || ''}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (userName) {
      localStorage.setItem(storageKey, JSON.stringify(todos));
      localStorage.setItem('todo_user_name', userName);
    }
  }, [todos, storageKey, userName]);

  // Load todos when user changes
  useEffect(() => {
    if (userName) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setTodos(JSON.parse(saved));
      } else {
        setTodos([]);
      }
    }
  }, [storageKey, userName]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  const monthTodos = useMemo(() => {
    return todos.filter(t => t.date.startsWith(format(currentDate, 'yyyy-MM')));
  }, [todos, currentDate]);

  const dailyScores = useMemo(() => {
    const scores: Record<string, number> = {};
    todos.forEach(todo => {
      if (todo.completed && todo.isMeaningful) {
        scores[todo.date] = (scores[todo.date] || 0) + 1;
      }
    });
    return scores;
  }, [todos]);

  const totalScore = useMemo(() => {
    return Object.values(dailyScores).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [dailyScores]);

  const todayScore = dailyScores[selectedDateStr] || 0;

  const handleAddTodo = () => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
      
    const newTodo: Todo = {
      id,
      text: '',
      completed: false,
      isMeaningful: false,
      date: selectedDateStr,
    };
    setTodos([...todos, newTodo]);
  };

  const handleUpdateTodoText = (id: string, text: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, text } : t));
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    if (!todo.completed) {
      setLoading(id);
      const isMeaningful = await validateTodoMeaning(todo.text);
      setLoading(null);
      
      setTodos(todos.map(t => t.id === id ? { ...t, completed: true, isMeaningful } : t));
    } else {
      setTodos(todos.map(t => t.id === id ? { ...t, completed: false } : t));
    }
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter(t => t.id === id));
  };

  const currentMonthTodos = todos.filter(t => t.date === selectedDateStr);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-zinc-400 py-2">
            {day}
          </div>
        ))}
        {calendarDays.map((day, idx) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const score = dailyScores[dayStr] || 0;
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <button
              key={dayStr}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "relative h-14 sm:h-20 border border-zinc-100 rounded-lg flex flex-col items-center justify-center transition-all hover:bg-zinc-50",
                !isCurrentMonth && "opacity-20",
                isSelected && "bg-zinc-900 text-white hover:bg-zinc-800 border-zinc-900 shadow-lg z-10"
              )}
            >
              <span className="text-sm font-medium">{format(day, 'd')}</span>
              {score > 0 && (
                <div className={cn(
                  "mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                  isSelected ? "bg-white text-zinc-900" : "bg-emerald-100 text-emerald-700"
                )}>
                  +{score}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const handleClaimReward = () => {
    if (totalScore >= 88) {
      alert('请加微信RHH199612领取奶茶');
    } else {
      alert('请继续努力冲击88分');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100">
      <AnimatePresence>
        {!userName && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-900/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">欢迎来到 2026 积分赛</h2>
              <p className="text-zinc-500 mb-8">请输入您的名字以保存您的专属积分记录</p>
              <form onSubmit={(e) => { e.preventDefault(); if (tempName.trim()) setUserName(tempName.trim()); }} className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="您的名字"
                  className="w-full px-6 py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
                />
                <button
                  type="submit"
                  disabled={!tempName.trim()}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200"
                >
                  开始记录
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-5xl font-light tracking-tight text-zinc-900">
                2026 <span className="font-serif italic text-emerald-600">积分赢奶茶</span> 活动
              </h1>
              {userName && (
                <button 
                  onClick={() => { if(confirm('确定要切换用户吗？')) { setUserName(''); setTempName(''); } }}
                  className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 rounded-full text-xs font-medium text-zinc-500 transition-colors"
                >
                  用户: {userName} (切换)
                </button>
              )}
            </div>
            <p className="text-zinc-500 max-w-md">
              赢取一杯奶茶，开启元气满满的一天！管理你的每日待办事项（记得做好信息脱敏哦 😉）。
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-zinc-100">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1 text-center min-w-[140px]">
              <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                {format(currentDate, 'yyyy')}
              </div>
              <div className="text-xl font-semibold">
                {format(currentDate, 'MMMM', { locale: zhCN })}
              </div>
            </div>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-zinc-50 rounded-xl transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Calendar */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-500" />
                日历视图
              </h2>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(m => (
                  <button
                    key={m}
                    onClick={() => setCurrentDate(setMonth(setYear(new Date(), 2026), m))}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                      currentDate.getMonth() === m 
                        ? "bg-zinc-900 text-white" 
                        : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100"
                    )}
                  >
                    {m + 1}
                  </button>
                ))}
              </div>
            </div>
            {renderCalendar()}
          </section>

          {/* Right Panel: Todos & Stats */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100">
                <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">今日积分</div>
                <div className="text-4xl font-light text-emerald-600">{todayScore}</div>
              </div>
              <div className="bg-zinc-900 p-6 rounded-3xl shadow-lg text-white">
                <div className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">总积分</div>
                <div className="text-4xl font-light">{totalScore} <span className="text-lg opacity-50">/ 88</span></div>
              </div>
            </div>

            {/* Todo List */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 flex-1 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-semibold">今日待办</h2>
                  <p className="text-zinc-400 text-sm">{format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}</p>
                </div>
                <button 
                  onClick={handleAddTodo}
                  className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {currentMonthTodos.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-zinc-300 py-12"
                    >
                      <CheckCircle2 className="w-12 h-12 mb-2 opacity-20" />
                      <p>今天还没有待办事项</p>
                    </motion.div>
                  ) : (
                    currentMonthTodos.map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "group flex flex-col gap-2 p-4 rounded-2xl border transition-all",
                          todo.completed 
                            ? "bg-zinc-50 border-transparent" 
                            : "bg-white border-zinc-100 hover:border-zinc-200 shadow-sm"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <button
                            disabled={loading === todo.id}
                            onClick={() => handleToggleTodo(todo.id)}
                            className={cn(
                              "flex-shrink-0 transition-transform active:scale-90",
                              loading === todo.id && "animate-pulse"
                            )}
                          >
                            {todo.completed ? (
                              <CheckCircle className={cn(
                                "w-6 h-6",
                                todo.isMeaningful ? "text-emerald-500" : "text-red-400"
                              )} />
                            ) : (
                              <Circle className="w-6 h-6 text-zinc-200 group-hover:text-zinc-400" />
                            )}
                          </button>
                          
                          <input
                            type="text"
                            value={todo.text}
                            onChange={(e) => handleUpdateTodoText(todo.id, e.target.value)}
                            placeholder="填写待办事项..."
                            disabled={todo.completed}
                            className={cn(
                              "flex-1 bg-transparent border-none focus:ring-0 p-0 text-zinc-700 placeholder:text-zinc-300",
                              todo.completed && "line-through text-zinc-400"
                            )}
                          />

                          {!todo.completed && (
                            <button 
                              onClick={() => handleRemoveTodo(todo.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-300 hover:text-red-400 transition-all"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          )}
                        </div>
                        {todo.completed && !todo.isMeaningful && (
                          <p className="text-[10px] text-red-400 ml-10 font-medium">
                            AI 判定此任务无实际意义，未计入积分。
                          </p>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Rules & Reward */}
              <div className="mt-8 pt-8 border-t border-zinc-100">
                <div className="bg-zinc-50 rounded-2xl p-4 mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                    <Info className="w-3 h-3" /> 活动规则
                  </h3>
                  <ul className="text-sm text-zinc-500 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      完成一个有意义的待办事项可获得 1 积分。
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      系统会自动识别无意义的输入（如纯数字或乱码）。
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      累计满 88 积分即可兑换奶茶一杯！
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleClaimReward}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg",
                    totalScore >= 88 
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-200" 
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  )}
                >
                  <Trophy className={cn("w-5 h-5", totalScore >= 88 ? "animate-bounce" : "")} />
                  {totalScore >= 88 ? "请加微信RHH199612领取奶茶" : "继续努力冲击 88 积分"}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E4E4E7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D4D4D8;
        }
      `}</style>
    </div>
  );
}
