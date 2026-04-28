/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout } from './lib/firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ContextFeed } from './components/ContextFeed';
import { TaskList } from './components/TaskList';
import { IntelligenceFeed } from './components/IntelligenceFeed';
import { Loader2, LogIn, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Startup } from './types';
import { collection, onSnapshot, query, limit, setDoc, doc } from 'firebase/firestore';
import { db } from './lib/firebase';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'syncs' | 'tasks' | 'intelligence'>('dashboard');
  const [startup, setStartup] = useState<Startup | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch or setup default startup for hackathon context
  useEffect(() => {
    if (user) {
      const startupId = 'hackathon-startup';
      const unsubscribe = onSnapshot(doc(db, 'startups', startupId), (snapshot) => {
        if (snapshot.exists()) {
          setStartup({ id: snapshot.id, ...snapshot.data() } as Startup);
        } else {
          // Create default startup for hackathon
          setDoc(doc(db, 'startups', startupId), {
            name: "CloudScale AI",
            mission: "Democratizing high-performance AI deployment for everyone.",
            industry: "DevTools / AI",
            createdAt: new Date().toISOString()
          });
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F5F2ED]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-[#141414]" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F2ED] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mx-auto shadow-xl">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-sans font-medium tracking-tight text-[#141414]">Founders Stack</h1>
            <p className="text-gray-600 font-sans">The AI intelligence layer for your early-stage startup.</p>
          </div>
          
          <button
            onClick={loginWithGoogle}
            className="flex items-center justify-center w-full bg-white border-1 border-[#141414] text-[#141414] py-4 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-sans font-medium group"
          >
            <LogIn className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
            Sign in with Google to Start
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} user={user}>
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <Dashboard startup={startup} user={user} />
          </motion.div>
        )}
        {activeTab === 'syncs' && (
          <motion.div
            key="syncs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <ContextFeed startupId={startup?.id || 'hackathon-startup'} />
          </motion.div>
        )}
        {activeTab === 'tasks' && (
          <motion.div
            key="tasks"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <TaskList startupId={startup?.id || 'hackathon-startup'} />
          </motion.div>
        )}
        {activeTab === 'intelligence' && (
          <motion.div
            key="intelligence"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <IntelligenceFeed startupId={startup?.id || 'hackathon-startup'} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

