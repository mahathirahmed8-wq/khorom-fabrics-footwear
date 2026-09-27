import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ChatMessage,
  subscribeToChatMessages,
  saveChatMessageToFirestore,
  deleteChatMessageFromFirestore,
  firebaseConfig,
} from '../../lib/firebase';
import {
  MessageSquare,
  Trash2,
  Send,
  User,
  Shield,
  Bot,
  Sparkles,
  Database,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

export const AdminChatsTab: React.FC = () => {
  const { language, currentUser, showToast } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'customer' | 'support' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to real-time chats from Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToChatMessages((firestoreMsgs) => {
      setMessages(firestoreMsgs || []);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSendingReply) return;

    setIsSendingReply(true);
    try {
      await saveChatMessageToFirestore({
        text: replyText.trim(),
        sender: currentUser?.name || 'খড়ম অ্যাডমিন টিম (Admin)',
        senderRole: 'admin',
        userId: currentUser?.id || 'admin',
        userEmail: currentUser?.email || 'khoromstore.info@gmail.com',
      });

      setReplyText('');
      showToast(
        language === 'bn'
          ? 'অ্যাডমিন রিপ্লাই ফায়ারবেসে সফলভাবে পোস্ট হয়েছে!'
          : 'Admin reply saved to Firebase Firestore successfully!'
      );
    } catch (err) {
      console.warn('Error posting admin reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm(language === 'bn' ? 'আপনি কি এই মেসেজটি ফায়ারবেস থেকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this message from Firebase?')) {
      return;
    }

    const success = await deleteChatMessageFromFirestore(msgId);
    if (success) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      showToast(
        language === 'bn'
          ? 'মেসেজটি ফায়ারবেস ডাটাবেজ থেকে মুছে ফেলা হয়েছে।'
          : 'Message removed from Firebase Firestore.'
      );
    } else {
      showToast('মেসেজটি মোছা সম্ভব হয়নি');
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filterRole !== 'all' && m.senderRole !== filterRole) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = m.text.toLowerCase().includes(q);
      const matchSender = m.sender.toLowerCase().includes(q);
      const matchEmail = (m.userEmail || '').toLowerCase().includes(q);
      return matchText || matchSender || matchEmail;
    }
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with Firebase indicator */}
      <div className="bg-gradient-to-r from-[#0c1424] to-[#0f192d] p-4 sm:p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-white font-serif flex items-center gap-2">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              <span>{language === 'bn' ? 'ফায়ারবেস লাইভ চ্যাট ও ইনবক্স' : 'Firebase Live Chat & Inbox'}</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firestore Live</span>
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            {language === 'bn'
              ? 'ইউজার ওয়েবসাইট থেকে চ্যাট করলে সরাসরি ফায়ারবেস (khorom2) ডাটাবেজে সেভ হচ্ছে এবং রিয়েল-টাইমে এখানে দেখা যাচ্ছে।'
              : 'User chat messages persist in real-time to Firebase Firestore (khorom2) and stream here automatically.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-[#080d19] px-3 py-1.5 rounded-xl border border-slate-700 text-amber-300 shrink-0">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Project: {firebaseConfig.projectId}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={language === 'bn' ? 'মেসেজ বা প্রেরক সার্চ করুন...' : 'Search messages...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0c1424] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['all', 'customer', 'admin', 'support'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors capitalize cursor-pointer shrink-0 min-h-[34px] ${
                filterRole === role
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-[#0c1424] hover:bg-slate-800 text-slate-400 border border-slate-800'
              }`}
            >
              {role === 'all' ? (language === 'bn' ? 'সকল বার্তা' : 'All') : role}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Reply Composer */}
      <form
        onSubmit={handleSendAdminReply}
        className="bg-[#0c1424] p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 shadow-md space-y-2.5"
      >
        <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'bn' ? 'অ্যাডমিন থেকে লাইভ রিপ্লাই পাঠান' : 'Post Official Admin Reply'}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'কাস্টমারদের উদ্দেশ্যে উত্তর বা নোটিশ লিখুন (সরাসরি ফায়ারবেসে সেভ হবে)...'
                : 'Write a response to customers (persists live to Firebase Firestore)...'
            }
            className="flex-1 px-3.5 py-2.5 bg-[#080d19] border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={!replyText.trim() || isSendingReply}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-40 shrink-0 min-h-[40px]"
          >
            <Send className="w-4 h-4" />
            <span>{language === 'bn' ? 'রিপ্লাই দিন' : 'Send'}</span>
          </button>
        </div>
      </form>

      {/* Message List */}
      <div className="bg-[#0c1424] rounded-2xl border border-slate-800 overflow-hidden shadow-md">
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">
            {language === 'bn'
              ? `মোট ${filteredMessages.length} টি বার্তা সংরক্ষিত রয়েছে`
              : `Total ${filteredMessages.length} messages in Firestore`}
          </span>
          <span className="text-[11px] text-slate-500">
            {language === 'bn' ? 'সর্বশেষ বার্তা সবার উপরে' : 'Newest first'}
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto slim-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              {language === 'bn'
                ? 'কোনো বার্তা পাওয়া যায়নি। ইউজার চ্যাট উইজেটে লিখলেই তা সরাসরি এখানে দৃশ্যমান হবে।'
                : 'No messages found yet. When users chat, messages will appear here in real-time.'}
            </div>
          ) : (
            [...filteredMessages].reverse().map((msg) => (
              <div key={msg.id} className="p-3.5 sm:p-4 hover:bg-slate-900/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        msg.senderRole === 'admin'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : msg.senderRole === 'support'
                          ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                          : 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                      }`}
                    >
                      {msg.senderRole === 'admin' ? (
                        <Shield className="w-4 h-4" />
                      ) : msg.senderRole === 'support' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-bold text-white truncate max-w-[150px]">{msg.sender}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                            msg.senderRole === 'admin'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : msg.senderRole === 'support'
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {msg.senderRole}
                        </span>
                        {msg.userEmail && (
                          <span className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                            {msg.userEmail}
                          </span>
                        )}
                        {msg.userPhone && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            📞 {msg.userPhone}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed bg-[#080d19] p-3 rounded-xl border border-slate-800/80 break-words">
                        {msg.text}
                      </p>

                      <span className="text-[10px] text-slate-500 block">
                        {new Date(msg.createdAt || Date.now()).toLocaleString(
                          language === 'bn' ? 'bn-BD' : 'en-US'
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Delete message from Firebase"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
