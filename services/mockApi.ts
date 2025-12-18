import { Complaint, ComplaintStatus, Department, NLPAnalysis, User, UserRole, DashboardStats } from '../types';

// Mock Data Store
let complaints: Complaint[] = [
  {
    id: 'SMG-2024-001',
    userId: 'u1',
    userName: 'John Doe',
    title: 'Huge pothole on Main St',
    description: 'There is a very deep pothole on Main Street near the central library. It is causing traffic buildup and is dangerous for bikes.',
    location: 'Main Street, City Center',
    status: ComplaintStatus.IN_PROGRESS,
    department: Department.PUBLIC_WORKS,
    dateSubmitted: '2024-05-10T10:00:00Z',
    dateUpdated: '2024-05-11T14:30:00Z',
    priority: 'High',
    attachments: [],
    nlpAnalysis: {
      predictedDepartment: Department.PUBLIC_WORKS,
      confidenceScore: 0.92,
      urgency: 'High',
      keywords: ['pothole', 'traffic', 'dangerous'],
      sentiment: 'Negative'
    }
  },
  {
    id: 'SMG-2024-002',
    userId: 'u2',
    userName: 'Jane Smith',
    title: 'No water supply for 2 days',
    description: 'We have not received any water supply in Sector 4 since Tuesday morning.',
    location: 'Sector 4, Green Valley',
    status: ComplaintStatus.SUBMITTED,
    department: Department.WATER_SUPPLY,
    dateSubmitted: '2024-05-12T08:15:00Z',
    dateUpdated: '2024-05-12T08:15:00Z',
    priority: 'High',
    attachments: [],
    nlpAnalysis: {
      predictedDepartment: Department.WATER_SUPPLY,
      confidenceScore: 0.88,
      urgency: 'High',
      keywords: ['water supply', 'sector 4'],
      sentiment: 'Negative'
    }
  },
  {
    id: 'SMG-2024-003',
    userId: 'u3',
    userName: 'Alice Johnson',
    title: 'Street light flickering',
    description: 'The street light outside house #45 is flickering constantly.',
    location: 'Rosewood Avenue',
    status: ComplaintStatus.RESOLVED,
    department: Department.ELECTRICITY,
    dateSubmitted: '2024-05-01T19:00:00Z',
    dateUpdated: '2024-05-03T11:00:00Z',
    priority: 'Low',
    attachments: [],
    nlpAnalysis: {
      predictedDepartment: Department.ELECTRICITY,
      confidenceScore: 0.95,
      urgency: 'Low',
      keywords: ['street light', 'flickering'],
      sentiment: 'Neutral'
    }
  }
];

// Simple keyword-based mock NLP
const mockNLPProcess = (text: string): NLPAnalysis => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('water') || lowerText.includes('leak') || lowerText.includes('pipe')) {
    return {
      predictedDepartment: Department.WATER_SUPPLY,
      confidenceScore: 0.89,
      urgency: 'High',
      keywords: ['water', 'pipe', 'leak'],
      sentiment: 'Negative'
    };
  }
  if (lowerText.includes('road') || lowerText.includes('pothole') || lowerText.includes('bridge')) {
    return {
      predictedDepartment: Department.PUBLIC_WORKS,
      confidenceScore: 0.94,
      urgency: 'High',
      keywords: ['pothole', 'road'],
      sentiment: 'Negative'
    };
  }
  if (lowerText.includes('electric') || lowerText.includes('power') || lowerText.includes('light')) {
    return {
      predictedDepartment: Department.ELECTRICITY,
      confidenceScore: 0.91,
      urgency: 'Medium',
      keywords: ['power', 'light'],
      sentiment: 'Neutral'
    };
  }
  if (lowerText.includes('garbage') || lowerText.includes('waste') || lowerText.includes('smell')) {
    return {
      predictedDepartment: Department.ENVIRONMENT,
      confidenceScore: 0.85,
      urgency: 'Medium',
      keywords: ['garbage', 'waste'],
      sentiment: 'Negative'
    };
  }

  return {
    predictedDepartment: Department.OTHER,
    confidenceScore: 0.60,
    urgency: 'Low',
    keywords: [],
    sentiment: 'Neutral'
  };
};

export const api = {
  login: async (email: string, role: UserRole): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'u_' + Math.random().toString(36).substr(2, 9),
          name: email.split('@')[0], // Default name from email
          email,
          role,
          department: role === UserRole.OFFICER ? Department.PUBLIC_WORKS : undefined
        });
      }, 800);
    });
  },

  register: async (name: string, email: string, role: UserRole): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: 'u_' + Math.random().toString(36).substr(2, 9),
          name,
          email,
          role,
          department: role === UserRole.OFFICER ? Department.PUBLIC_WORKS : undefined
        });
      }, 1000);
    });
  },

  submitComplaint: async (complaintData: Partial<Complaint>, user: User): Promise<Complaint> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = mockNLPProcess(complaintData.description || '');
        
        const newComplaint: Complaint = {
          id: `SMG-2024-${Math.floor(1000 + Math.random() * 9000)}`,
          userId: user.id,
          userName: user.name,
          title: complaintData.title || 'Untitled Complaint',
          description: complaintData.description || '',
          location: complaintData.location || 'Unknown',
          status: ComplaintStatus.SUBMITTED,
          department: analysis.predictedDepartment, // Auto-routed
          dateSubmitted: new Date().toISOString(),
          dateUpdated: new Date().toISOString(),
          priority: analysis.urgency,
          attachments: complaintData.attachments || [],
          nlpAnalysis: analysis
        };
        
        complaints = [newComplaint, ...complaints];
        resolve(newComplaint);
      }, 1500); // Simulate NLP processing time
    });
  },

  getComplaints: async (role: UserRole, department?: Department): Promise<Complaint[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (role === UserRole.OFFICER && department) {
          resolve(complaints.filter(c => c.department === department));
        } else if (role === UserRole.CITIZEN) {
          // In a real app, filter by user ID. Here we return all for demo
          resolve(complaints); 
        } else {
          resolve(complaints);
        }
      }, 600);
    });
  },

  updateStatus: async (id: string, status: ComplaintStatus): Promise<Complaint | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = complaints.findIndex(c => c.id === id);
        if (idx !== -1) {
          complaints[idx] = { ...complaints[idx], status, dateUpdated: new Date().toISOString() };
          resolve(complaints[idx]);
        } else {
          resolve(undefined);
        }
      }, 500);
    });
  },

  getStats: async (): Promise<DashboardStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = complaints.length;
        const pending = complaints.filter(c => c.status !== ComplaintStatus.RESOLVED && c.status !== ComplaintStatus.CLOSED).length;
        const resolved = complaints.filter(c => c.status === ComplaintStatus.RESOLVED).length;
        resolve({
          total,
          pending,
          resolved,
          avgResolutionTime: '1.8 Days'
        });
      }, 500);
    });
  }
};