import React, { useState, useEffect } from 'react';
import { User, Complaint } from '../types';
import { api } from '../services/mockApi';
import ComplaintCard from '../components/ComplaintCard';
import { Plus, List, MapPin, Upload, X, Loader2 } from 'lucide-react';

interface Props {
  user: User;
}

const CitizenDashboard: React.FC<Props> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('list');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    setLoading(true);
    const data = await api.getComplaints(user.role);
    setComplaints(data);
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);

    // Simulate sending data to backend
    const newComplaint = await api.submitComplaint({
      title,
      description,
      location,
      attachments: files.map(f => f.name)
    }, user);

    setIsSubmitting(false);
    setSubmitSuccess(newComplaint.id);
    
    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setFiles([]);
    
    // Refresh list
    loadComplaints();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-500">Manage your grievances and track their status</p>
        </div>
        <button 
          onClick={() => {
            setActiveTab('submit');
            setSubmitSuccess(null);
          }}
          className="mt-4 md:mt-0 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          New Complaint
        </button>
      </div>

      <div className="flex gap-6 mb-6 border-b border-gray-200">
        <button 
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('list')}
        >
          My Complaints
        </button>
        <button 
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${activeTab === 'submit' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit New
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full flex justify-center py-12">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : complaints.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No complaints found. Submit your first one!</p>
            </div>
          ) : (
            complaints.map(c => (
              <ComplaintCard 
                key={c.id} 
                complaint={c} 
                role={user.role} 
                onClick={() => {}} // Could open detail modal
              />
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
              <p className="text-gray-600 mb-6">
                Your complaint ID is <span className="font-mono font-bold text-gray-900">{submitSuccess}</span>.<br/>
                We have automatically routed it to the relevant department based on your description.
              </p>
              <button 
                onClick={() => setActiveTab('list')}
                className="text-primary font-medium hover:underline"
              >
                View Status →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="Brief summary of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <div className="relative">
                  <textarea 
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    placeholder="Describe the issue in detail. Our AI will analyze this to identify the department and urgency."
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    AI Analysis Enabled
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      required
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Street, Landmark, Area"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      multiple
                      onChange={handleFileChange}
                      className="hidden" 
                      id="file-upload"
                    />
                    <label 
                      htmlFor="file-upload"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload size={18} />
                      <span>{files.length > 0 ? `${files.length} files selected` : 'Upload Photos/Docs'}</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setActiveTab('list')}
                  className="px-6 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Analyzing & Submitting...
                    </>
                  ) : 'Submit Complaint'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CitizenDashboard;