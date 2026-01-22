
import React from 'react';
import { AlertCircle, ThumbsUp, Flag, MessageSquare, ExternalLink, Calendar } from 'lucide-react';
import { ScamReport, RiskLevel } from '../types';

interface ReportCardProps {
  report: ScamReport;
  onClick: (report: ScamReport) => void;
}

const getRiskColor = (level: RiskLevel) => {
  switch (level) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default: return 'bg-blue-100 text-blue-700 border-blue-200';
  }
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
  return (
    <div 
      onClick={() => onClick(report)}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRiskColor(report.riskLevel)}`}>
            {report.riskLevel} Risk
          </span>
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {report.category}
          </span>
        </div>
        <div className="flex items-center text-slate-400 text-xs font-medium">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(report.createdAt).toLocaleDateString()}
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
        {report.title}
      </h3>
      
      <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
        {report.description}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="block text-[10px] text-slate-400 uppercase font-bold">Scammer</span>
          <span className="text-sm font-semibold text-slate-700 truncate block">
            {report.scammerName || report.scammerHandle || 'Anonymous'}
          </span>
        </div>
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
          <span className="block text-[10px] text-slate-400 uppercase font-bold">Platform</span>
          <span className="text-sm font-semibold text-slate-700 truncate block">{report.platform}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
            <ThumbsUp className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-bold">{report.upvotes}</span>
          </div>
          <div className="flex items-center text-slate-500 hover:text-red-500 transition-colors">
            <Flag className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-bold">{report.flags}</span>
          </div>
        </div>
        <div className="flex items-center text-slate-400 text-xs">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          <span className="font-medium">{report.comments.length} Comments</span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
