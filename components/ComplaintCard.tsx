import React from 'react';
import { Complaint, UserRole } from '../types';
import StatusBadge from './StatusBadge';
import { Calendar, MapPin, AlertCircle, TrendingUp } from 'lucide-react';

interface Props {
  complaint: Complaint;
  role: UserRole;
  onClick: () => void;
}

const ComplaintCard: React.FC<Props> = ({ complaint, role, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-xs text-gray-500 font-mono">#{complaint.id}</span>
          <h3 className="font-semibold text-gray-900 line-clamp-1">{complaint.title}</h3>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {complaint.description}
      </p>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{new Date(complaint.dateSubmitted).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span className="line-clamp-1 max-w-[120px]">{complaint.location}</span>
        </div>
        
        {role !== UserRole.CITIZEN && complaint.nlpAnalysis && (
           <div className="flex items-center gap-1 text-primary font-medium">
             <TrendingUp size={14} />
             <span>{Math.round(complaint.nlpAnalysis.confidenceScore * 100)}% Conf.</span>
           </div>
        )}

        <div className={`flex items-center gap-1 font-medium ${complaint.priority === 'High' ? 'text-red-600' : 'text-gray-500'}`}>
          <AlertCircle size={14} />
          <span>{complaint.priority} Priority</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-xs">
        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
          {complaint.department}
        </span>
        <span className="text-primary hover:underline">View Details →</span>
      </div>
    </div>
  );
};

export default ComplaintCard;