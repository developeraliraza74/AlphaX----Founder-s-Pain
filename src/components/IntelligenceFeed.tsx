import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AIEcosystemNews, Startup } from '../types';
import { getAIEcosystemUpdate } from '../lib/gemini';
import { motion } from 'motion/react';
import { Zap, RefreshCw, AlertTriangle, ExternalLink, TrendingUp, Info } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export function IntelligenceFeed({ startupId }: { startupId: string }) {
  const [news, setNews] = useState<AIEcosystemNews[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [startup, setStartup] = useState<Startup | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'startups', startupId, 'news'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (s) => {
      setNews(s.docs.map(d => ({ id: d.id, ...d.data() } as AIEcosystemNews)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `startups/${startupId}/news`));
    return () => unsubscribe();
  }, [startupId]);

  const triggerUpdate = async () => {
    setIsUpdating(true);
    try {
      const stack = "React, Vite, Tailwind, Firebase, Gemini 3.0, Node.js";
      const update = await getAIEcosystemUpdate(stack);
      
      await addDoc(collection(db, 'startups', startupId, 'news'), {
        ...update,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Intel update error:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">AI Intel</h1>
          <p className="text-gray-500 mt-2">Personalized technical intelligence for your startup stack.</p>
        </div>
        <button 
          onClick={triggerUpdate}
          disabled={isUpdating}
          className="flex items-center px-6 py-3 bg-white border-1 border-[#141414] text-[#141414] rounded-xl shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-all font-medium text-sm"
        >
          {isUpdating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Fetch New Insight
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white border-1 border-gray-100 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
               {item.category === 'model' && <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><Zap className="w-5 h-5 text-blue-500" /></div>}
               {item.category === 'pricing' && <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-500" /></div>}
               {item.category === 'deprecation' && <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-500" /></div>}
               {item.category === 'framework' && <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center"><Info className="w-5 h-5 text-indigo-500" /></div>}
            </div>

            <div className="relative z-10 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 block">
                  {item.category} Update • {formatDate(item.timestamp)}
                </span>
                <h3 className="text-2xl font-medium leading-tight group-hover:text-blue-600 transition-colors">{item.title}</h3>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600 leading-relaxed font-sans">{item.content}</p>
                <div className="bg-gray-50/50 p-6 rounded-2xl border-1 border-gray-100/50">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Impact on Your Stack</h4>
                  <p className="text-sm text-gray-800 italic leading-relaxed font-sans">{item.impact}</p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                 <button className="flex items-center text-xs font-bold uppercase tracking-widest text-[#141414] hover:underline">
                   Read Documentation <ExternalLink className="w-3 h-3 ml-2" />
                 </button>
              </div>
            </div>
          </motion.div>
        ))}
        {news.length === 0 && (
           <div className="col-span-full p-20 border-2 border-dashed border-gray-100 rounded-[40px] text-center">
              <Zap className="w-12 h-12 text-gray-200 mx-auto mb-6" />
              <p className="text-gray-400 italic">No intelligence updates yet. Click fetch to scan the AI ecosystem.</p>
           </div>
        )}
      </div>
    </div>
  );
}
