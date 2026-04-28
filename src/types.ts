import React from 'react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Startup {
  id: string;
  name: string;
  mission: string;
  industry: string;
  createdAt: string;
}

export interface ContextUpdate {
  id: string;
  source: string;
  summary: string;
  rawContent: string;
  timestamp: string;
  authorId: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dueDate?: string;
  sourceUpdateId?: string;
}

export interface AIEcosystemNews {
  id: string;
  title: string;
  content: string;
  impact: string;
  url?: string;
  category: 'model' | 'framework' | 'pricing' | 'deprecation';
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'founder' | 'engineer' | 'designer' | 'business';
  avatarUrl?: string;
}
