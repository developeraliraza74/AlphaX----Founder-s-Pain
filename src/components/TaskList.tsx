import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ActionItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Clock, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';

export function TaskList({ startupId }: { startupId: string }) {
  const [tasks, setTasks] = useState<ActionItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const q = query(
      collection(db, 'startups', startupId, 'tasks'),
      orderBy('priority', 'desc')
    );
    const unsubscribe = onSnapshot(q, (s) => {
      setTasks(s.docs.map(d => ({ id: d.id, ...d.data() } as ActionItem)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `startups/${startupId}/tasks`));
    return () => unsubscribe();
  }, [startupId]);

  const toggleTask = async (task: ActionItem) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateDoc(doc(db, 'startups', startupId, 'tasks', task.id), {
        status: newStatus
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `startups/${startupId}/tasks/${task.id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'startups', startupId, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `startups/${startupId}/tasks/${id}`);
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'all' || t.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-medium tracking-tight">Action Items</h1>
          <p className="text-gray-500 mt-2">AI-extracted tasks from your syncs and meetings.</p>
        </div>
        <div className="flex bg-white rounded-xl p-1 border-1 border-gray-100 shadow-sm">
           {['all', 'pending', 'completed'].map(f => (
             <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize",
                filter === f ? "bg-[#141414] text-white" : "text-gray-400 hover:text-gray-600"
              )}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center text-gray-400 italic"
            >
              No tasks found for this filter.
            </motion.div>
          ) : (
            filteredTasks.map((task, i) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={cn(
                  "group p-6 bg-white border-1 border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-6",
                  task.status === 'completed' && "opacity-60 grayscale-[0.5]"
                )}
              >
                <button 
                  onClick={() => toggleTask(task)}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-8 h-8 text-green-500 fill-green-50" />
                  ) : (
                    <Circle className="w-8 h-8 text-gray-200 hover:text-[#141414] transition-colors" />
                  )}
                </button>
                
                <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                        task.priority === 'high' ? "bg-red-50 text-red-600" : 
                        task.priority === 'medium' ? "bg-amber-50 text-amber-600" : 
                        "bg-blue-50 text-blue-600"
                      )}>
                        {task.priority}
                      </span>
                      {task.assignedTo && (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          Assigned: {task.assignedTo}
                        </span>
                      )}
                   </div>
                   <h3 className={cn(
                     "text-lg font-medium transition-all",
                     task.status === 'completed' && "line-through text-gray-400"
                   )}>
                    {task.title}
                   </h3>
                   <p className="text-gray-500 text-sm mt-1 max-w-2xl">{task.description}</p>
                </div>

                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
