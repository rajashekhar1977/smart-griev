import { Complaint, ComplaintStatus, Department, User, UserRole, DashboardStats } from '../types';
import { supabase, getAuthToken } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const api = {
  login: async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      return {
        id: data.user.id,
        name: email.split('@')[0],
        email: data.user.email || email,
        role: UserRole.CITIZEN
      };
    }

    return {
      id: data.user.id,
      name: profile.name,
      email: data.user.email || email,
      role: profile.role as UserRole,
      department: profile.department || undefined
    };
  },

  register: async (name: string, email: string, password: string, role: UserRole): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    if (!data.user) throw new Error('Registration failed');

    const profileData = {
      id: data.user.id,
      name,
      role,
      phone: '',
      department: role === UserRole.OFFICER ? Department.PUBLIC_WORKS : null
    };

    await supabase.from('profiles').insert(profileData);

    return {
      id: data.user.id,
      name,
      email: data.user.email || email,
      role,
      department: profileData.department || undefined
    };
  },

  submitComplaint: async (
    complaintData: Partial<Complaint>,
    user: User
  ): Promise<Complaint> => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/complaints/submit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: complaintData.title,
        description: complaintData.description,
        location: complaintData.location
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit complaint');
    }

    const data = await response.json();

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.userName || user.name,
      title: data.title,
      description: data.description,
      location: data.location,
      status: data.status as ComplaintStatus,
      department: data.department as Department,
      dateSubmitted: data.date_submitted,
      dateUpdated: data.date_updated,
      priority: data.priority as 'Low' | 'Medium' | 'High',
      attachments: complaintData.attachments || [],
      nlpAnalysis: data.nlp_analysis ? {
        predictedDepartment: data.nlp_analysis.predictedDepartment as Department,
        confidenceScore: data.nlp_analysis.confidenceScore,
        urgency: data.nlp_analysis.urgency,
        keywords: data.nlp_analysis.keywords,
        sentiment: data.nlp_analysis.sentiment
      } : undefined
    };
  },

  getComplaints: async (role: UserRole, department?: Department): Promise<Complaint[]> => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/complaints`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch complaints');
    }

    const data = await response.json();

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      userName: item.userName || 'Unknown User',
      title: item.title,
      description: item.description,
      location: item.location,
      status: item.status as ComplaintStatus,
      department: item.department as Department,
      dateSubmitted: item.date_submitted,
      dateUpdated: item.date_updated,
      priority: item.priority as 'Low' | 'Medium' | 'High',
      attachments: [],
      nlpAnalysis: item.nlp_analysis ? {
        predictedDepartment: item.nlp_analysis.predictedDepartment as Department,
        confidenceScore: item.nlp_analysis.confidenceScore,
        urgency: item.nlp_analysis.urgency,
        keywords: item.nlp_analysis.keywords,
        sentiment: item.nlp_analysis.sentiment
      } : undefined
    }));
  },

  updateStatus: async (
    id: string,
    status: ComplaintStatus
  ): Promise<Complaint | undefined> => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/complaints/${id}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update status');
    }

    const data = await response.json();

    return {
      id: data.id,
      userId: data.user_id,
      userName: data.userName || 'Unknown User',
      title: data.title,
      description: data.description,
      location: data.location,
      status: data.status as ComplaintStatus,
      department: data.department as Department,
      dateSubmitted: data.date_submitted,
      dateUpdated: data.date_updated,
      priority: data.priority as 'Low' | 'Medium' | 'High',
      attachments: [],
      nlpAnalysis: data.nlp_analysis
    };
  },

  getStats: async (): Promise<DashboardStats> => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/analytics`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return await response.json();
  },

  getDepartments: async (): Promise<any[]> => {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/departments`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }

    return await response.json();
  }
};
