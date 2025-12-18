import React from 'react';
import { ComplaintStatus } from '../types';

interface Props {
  status: ComplaintStatus;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const getColors = (s: ComplaintStatus) => {
    switch (s) {
      case ComplaintStatus.SUBMITTED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ComplaintStatus.ASSIGNED:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ComplaintStatus.RESOLVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ComplaintStatus.CLOSED:
        return 'bg-gray-800 text-white border-gray-900';
      case ComplaintStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColors(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;