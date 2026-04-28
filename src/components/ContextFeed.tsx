import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ContextUpdate } from '../types';
import { summarizeSync, extractTasks } from '../lib/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Send, RefreshCw, FileText, Slack, MessageSquare } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export function ContextFeed({ startupId }: { startupId: string }) {
  const [updates, setUpdates] = useState<ContextUpdate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [source, setSource] = useState('Meeting Notes');

  useEffect(() => {
    const q = query(
      collection(db, 'startups', startupId, 'updates'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (s) => {
      setUpdates(s.docs.map(d => ({ id: d.id, ...d.data() } as ContextUpdate)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `startups/${startupId}/updates`));
    return () => unsubscribe();
  }, [startupId]);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim() || !auth.currentUser) return;

    setIsSyncing(true);
    try {
      // 1. Summarize content
      const summary = await summarizeSync(source, rawContent);
      
      // 2. Extract tasks
      const tasks = await extractTasks(rawContent);

      // 3. Save Context Update
      const updateDoc = await addDoc(collection(db, 'startups', startupId, 'updates'), {
        source,
        summary,
        rawContent,
        timestamp: new Date().toISOString(),
        authorId: auth.currentUser.uid
      });

      // 4. Save Extracted Tasks
      for (const task of tasks) {
        await addDoc(collection(db, 'startups', startupId, 'tasks'), {
          ...task,
          status: 'pending',
          sourceUpdateId: updateDoc.id,
          createdAt: serverTimestamp()
        });
      }

      setRawContent('');
      setShowModal(false);
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Context Sync</h1>
          <p className="text-gray-500 mt-2">Harmonize decisions and updates across your tools.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center px-6 py-3 bg-[#141414] text-white rounded-xl shadow-lg hover:translate-y-[-2px] transition-all font-medium text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Sync New Context
        </button>
      </div>

      <div className="space-y-6">
        {updates.map((update, i) => (
          <motion.div
            key={update.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border-1 border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-8 flex items-start gap-6">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 border-1 border-gray-100">
                {update.source.includes('Slack') ? <Slack className="w-6 h-6 text-indigo-500" /> : 
                 update.source.includes('Meeting') ? <MessageSquare className="w-6 h-6 text-green-500" /> : 
                 <FileText className="w-6 h-6 text-gray-400" />}
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">{update.source}</h3>
                  <span className="text-xs text-gray-400 font-medium">{formatDate(update.timestamp)}</span>
                </div>
                <div className="prose prose-sm prose-neutral max-w-none prose-p:leading-relaxed text-gray-700 font-sans">
                   <ReactMarkdown>{update.summary}</ReactMarkdown>
                </div>
                <div className="pt-4 flex items-center justify-between border-t-1 border-gray-50">
                   <button className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-[#141414] transition-colors">
                     View Raw Transcript
                   </button>
                   <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white" />
                      <div className="w-6 h-6 rounded-full bg-green-100 border-2 border-white" />
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sync Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-24 bg-[#141414]/10 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-10 pb-0 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-medium tracking-tight">AI Context Processor</h2>
                  <p className="text-gray-400 text-sm mt-1">Paste transcripts, notes, or messages to extract tasks and sync context.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSync} className="p-10 flex-1 flex flex-col space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Source Type</label>
                  <div className="flex gap-2">
                    {['Meeting Notes', 'Slack Thread', 'Notion Doc', 'Founders Chat'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSource(t)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-medium border-1 transition-all",
                          source === t ? "bg-[#141414] text-white border-[#141414]" : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-h-[200px] flex flex-col space-y-4">
                   <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 font-sans">Raw Context</label>
                   <textarea
                    value={rawContent}
                    onChange={(e) => setRawContent(e.target.value)}
                    placeholder="Paste meeting transcript or development notes here..."
                    className="flex-1 w-full bg-gray-50 rounded-3xl p-6 text-sm text-[#141414] border-gray-100 focus:border-[#141414] outline-none transition-all placeholder:text-gray-300 resize-none leading-relaxed font-sans"
                   />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t-1 border-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSyncing || !rawContent.trim()}
                    className="flex items-center px-8 py-3 bg-[#141414] text-white rounded-2xl shadow-xl hover:translate-y-[-2px] disabled:opacity-50 disabled:translate-y-0 transition-all font-medium text-sm"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        AI Extraction...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Process & Sync
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
