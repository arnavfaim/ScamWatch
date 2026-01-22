
import React, { useState } from 'react';
import { X, ThumbsUp, Flag, Send, ShieldAlert, CheckCircle, Trash2, ShieldQuestion, Info, Phone, Mail } from 'lucide-react';
import { ScamReport, UserRole, Comment } from '../types';

interface ReportDetailProps {
  report: ScamReport;
  onClose: () => void;
  userRole: UserRole;
  onAction: (reportId: string, action: 'approve' | 'reject' | 'delete' | 'comment' | 'vote' | 'flag', payload?: any) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onClose, userRole, onAction }) => {
  const [commentText, setCommentText] = useState('');

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAction(report.id, 'comment', { text: commentText });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-start bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${report.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {report.status}
              </span>
              <span className="text-slate-400 text-xs font-medium">Report ID: #{report.id}</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">{report.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-indigo-600" />
                Evidence Summary
              </h3>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Primary Name</label>
                  <p className="text-slate-900 font-bold">{report.scammerName || 'Not disclosed'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Contact / Handle</label>
                  <p className="text-slate-900 font-bold">{report.scammerContact || 'Not disclosed'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                     <Phone className="h-2 w-2" /> WhatsApp
                  </label>
                  <p className="text-indigo-600 font-bold">{report.whatsappNumber || 'None provided'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Platform</label>
                  <p className="text-slate-900 font-bold">{report.platform}</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Description</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm">{report.description}</p>
            </section>

            {report.aiSummary && (
              <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-2">Automated Threat Analysis</h3>
                <p className="text-indigo-800 italic leading-relaxed text-sm">"{report.aiSummary}"</p>
              </section>
            )}

            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Proof Screenshots</h3>
              {report.proofUrls.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {report.proofUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="block border-2 border-slate-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all">
                      <img src={url} className="w-full h-auto object-cover max-h-80" alt="Proof" />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
                   <Info className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                   <p className="text-slate-400 text-sm font-medium">No visual evidence provided with this report.</p>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Comments</h3>
              <div className="space-y-4">
                {report.comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <div className="h-10 w-10 shrink-0 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
                      {comment.userName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900">{comment.userName}</span>
                        <span className="text-[10px] font-medium text-slate-400">{new Date(comment.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600">{comment.text}</p>
                    </div>
                  </div>
                ))}
                
                <form onSubmit={handleComment} className="flex gap-4 mt-6">
                  <input 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add more context..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors">
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             {userRole !== 'user' && (
                <div className="bg-indigo-600 text-white rounded-2xl p-6 shadow-xl shadow-indigo-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Internal Report Info</h4>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                           <Mail className="h-4 w-4 opacity-60" />
                           <span className="text-xs font-bold truncate">{report.reporterEmail || 'No email provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <ShieldAlert className="h-4 w-4 opacity-60" />
                           <span className="text-xs font-bold truncate">Reporter ID: {report.reporterId}</span>
                        </div>
                    </div>
                </div>
             )}

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Validation</h3>
              
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => onAction(report.id, 'vote')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="bg-white h-14 w-14 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                    <ThumbsUp className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Vouch ({report.upvotes})</span>
                </button>

                <button 
                  onClick={() => onAction(report.id, 'flag')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="bg-white h-14 w-14 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-red-500 group-hover:border-red-200 transition-all">
                    <Flag className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Flag ({report.flags})</span>
                </button>
              </div>

              {userRole !== 'user' && (
                <div className="space-y-3 pt-6 border-t border-slate-200">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Moderator Controls</h4>
                  
                  {report.status !== 'approved' && (
                    <button 
                      onClick={() => onAction(report.id, 'approve')}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-100"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </button>
                  )}
                  
                  {report.status !== 'rejected' && (
                    <button 
                      onClick={() => onAction(report.id, 'reject')}
                      className="w-full flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-3 rounded-xl transition-all"
                    >
                      <ShieldQuestion className="h-4 w-4" />
                      Reject
                    </button>
                  )}

                  <button 
                    onClick={() => onAction(report.id, 'delete')}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
