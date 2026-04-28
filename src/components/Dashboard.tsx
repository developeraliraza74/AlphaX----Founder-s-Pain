import React, { useEffect, useState } from 'react';
import { Startup, ContextUpdate, ActionItem, AIEcosystemNews } from '../types';
import { User } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  Clock, 
  MessageSquare, 
  Trophy, 
  Users,
  Settings,
  Plus,
  CheckSquare,
  Zap
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

interface DashboardProps {
  startup: Startup | null;
  user: User;
}

export function Dashboard({ startup, user }: DashboardProps) {
  const [updates, setUpdates] = useState<ContextUpdate[]>([]);
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [news, setNews] = useState<AIEcosystemNews[]>([]);

  useEffect(() => {
    if (startup) {
      const uq = query(collection(db, 'startups', startup.id, 'updates'), orderBy('timestamp', 'desc'), limit(3));
      const tq = query(collection(db, 'startups', startup.id, 'tasks'), orderBy('dueDate', 'asc'), limit(5));
      const nq = query(collection(db, 'startups', startup.id, 'news'), orderBy('timestamp', 'desc'), limit(3));

      const unsubUpdates = onSnapshot(uq, (s) => setUpdates(s.docs.map(d => ({ id: d.id, ...d.data() } as ContextUpdate))));
      const unsubTasks = onSnapshot(tq, (s) => setTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as ActionItem))));
      const unsubNews = onSnapshot(nq, (s) => setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as AIEcosystemNews))));

      return () => {
        unsubUpdates();
        unsubTasks();
        unsubNews();
      };
    }
  }, [startup]);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">
            {startup ? startup.name : 'Startup Command'}
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg">
            {startup ? startup.mission : 'Welcome back, founder. Here is your startup pulse.'}
          </p>
        </div>
        {!startup && (
           <button className="flex items-center px-6 py-3 bg-[#141414] text-white rounded-xl shadow-lg hover:translate-y-[-2px] transition-all font-medium text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Setup Startup
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Pulse */}
        <div className="col-span-8 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400 flex items-center">
                <Clock className="w-3 h-3 mr-2" />
                Recent Pulse
              </h2>
              <button className="text-xs font-medium text-[#141414] hover:underline flex items-center">
                View History <ArrowUpRight className="w-3 h-3 ml-1" />
              </button>
            </div>
            
            <div className="space-y-4">
              {updates.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                  <p className="text-gray-400 text-sm italic font-sans">No context syncs recorded yet. Start by syncing a document or meeting notes.</p>
                </div>
              ) : (
                updates.map((update, i) => (
                  <motion.div 
                    key={update.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-white p-6 rounded-3xl border-1 border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-500 rounded-full border-1 border-gray-100">
                        {update.source}
                      </span>
                      <span className="text-[10px] text-gray-300 font-medium">{formatDate(update.timestamp)}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed font-sans">{update.summary}</p>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          <section>
             <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400 flex items-center">
                <Users className="w-3 h-3 mr-2" />
                Founders Alignment
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#141414] p-8 rounded-3xl text-white relative overflow-hidden group border-1 border-[#141414]">
                 <div className="relative z-10">
                   <h3 className="text-lg font-medium mb-1">Paul</h3>
                   <p className="text-white/60 text-xs mb-4 uppercase tracking-widest">Business Operations</p>
                   <p className="text-sm text-white/80 italic leading-relaxed">"Investor reply sent. Accelerator deadline tracked."</p>
                 </div>
                 <MessageSquare className="absolute -bottom-4 -right-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
              </div>
              <div className="bg-white p-8 rounded-3xl border-1 border-gray-100 relative overflow-hidden group">
                 <div className="relative z-10">
                   <h3 className="text-lg font-medium mb-1 text-[#141414]">Sam</h3>
                   <p className="text-gray-400 text-xs mb-4 uppercase tracking-widest font-semibold">Technical Architecture</p>
                   <p className="text-gray-600 text-sm italic leading-relaxed">"Gemini 3.1 cost analysis ready. Deployment stable."</p>
                 </div>
                 <Settings className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-50 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Tasks & Intel */}
        <div className="col-span-4 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400 flex items-center">
                <CheckSquare className="w-3 h-3 mr-2" />
                Hot Tasks
              </h2>
            </div>
            <div className="bg-white rounded-3xl border-1 border-gray-100 shadow-sm overflow-hidden">
              {tasks.length === 0 ? (
                <div className="p-8 text-center text-gray-300 text-sm italic py-10">No urgent tasks.</div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="p-4 border-b-1 border-gray-50 hover:bg-gray-50 transition-colors flex items-start">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-2 mr-3 shrink-0",
                      task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <div>
                      <p className="text-sm font-medium text-gray-800 leading-tight">{task.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">{task.assignedTo || 'Unassigned'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400 flex items-center">
                <Zap className="w-3 h-3 mr-2" />
                AI Intel
              </h2>
            </div>
            <div className="space-y-4">
               {news.length === 0 ? (
                 <div className="bg-amber-50/50 p-6 rounded-3xl border-1 border-amber-100/50">
                    <p className="text-amber-800/60 text-xs font-sans leading-relaxed italic">Intelligence feed waiting for stack definition...</p>
                 </div>
               ) : (
                 news.map(item => (
                   <div key={item.id} className="bg-white p-5 rounded-3xl border-1 border-gray-100 shadow-sm">
                      <div className="flex items-center mb-2">
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tighter mr-2">{item.category}</span>
                        <div className="h-px flex-1 bg-gray-50" />
                      </div>
                      <h4 className="text-sm font-medium mb-2">{item.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>
                   </div>
                 ))
               )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
