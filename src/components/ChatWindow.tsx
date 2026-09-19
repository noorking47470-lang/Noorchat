import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Image as ImageIcon,
  Paperclip,
  Mic,
  Square,
  Smile,
  Check,
  CheckCheck,
  Play,
  Pause,
  Download,
  X,
} from 'lucide-react';
import { playSentSound, playNotificationSound } from '../utils/audio';

interface ChatWindowProps {
  currentUser: User;
  peer: User;
  messages: Message[];
  onSendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'status'>) => void;
  onBack: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onAddReaction: (messageId: string, emoji: string) => void;
}

const EMOJI_LIST = ['❤️', '👍', '😂', '🔥', '👏', '😍', '✨', '🙌', '🎉', '💯'];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  peer,
  messages,
  onSendMessage,
  onBack,
  onStartCall,
  onAddReaction,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);
  const [activeMediaModal, setActiveMediaModal] = useState<string | null>(null);
  const [isPeerTyping, setIsPeerTyping] = useState(false);

  // Voice note recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPeerTyping]);

  // Handle voice note recording
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage({
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            recipientId: peer.id,
            type: 'audio',
            content: 'Voice message',
            mediaUrl: base64Audio,
            audioDuration: recordingSeconds || 3,
          });
          playSentSound();
        };
        reader.readAsDataURL(audioBlob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission error for voice note:', err);
      // Simulated voice note fallback if mic is blocked in sandbox iframe
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopVoiceRecording = (send: boolean) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      if (send) {
        mediaRecorderRef.current.stop();
      } else {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
    } else if (send) {
      // Fallback voice note item
      onSendMessage({
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        recipientId: peer.id,
        type: 'audio',
        content: 'Voice note (0:04)',
        mediaUrl: '',
        audioDuration: recordingSeconds || 4,
      });
      playSentSound();
    }
  };

  // Play audio message
  const handlePlayAudio = (msgId: string, audioUrl?: string) => {
    if (playingAudioId === msgId) {
      activeAudioElementRef.current?.pause();
      setPlayingAudioId(null);
      return;
    }

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      activeAudioElementRef.current = audio;
      setPlayingAudioId(msgId);
      audio.onended = () => setPlayingAudioId(null);
      audio.play().catch((e) => console.warn('Audio play error:', e));
    } else {
      // Simulate playback
      setPlayingAudioId(msgId);
      setTimeout(() => setPlayingAudioId(null), 3000);
    }
  };

  // Handle Text Send
  const handleSendText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !previewMediaUrl) return;

    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId: peer.id,
      type: previewMediaUrl ? 'image' : 'text',
      content: inputText.trim() || 'Photo',
      mediaUrl: previewMediaUrl || undefined,
      mediaName: previewMediaUrl ? 'shared_photo.jpg' : undefined,
    });

    playSentSound();
    setInputText('');
    setPreviewMediaUrl(null);
    setShowEmojiPicker(false);

    // Simulate smart interactive peer response
    setTimeout(() => {
      setIsPeerTyping(true);
      setTimeout(() => {
        setIsPeerTyping(false);
        const peerReplies = [
          'Got it! Noor Chat is super fast and smooth 🚀',
          'That sounds great! I am testing the Android video & voice call quality now.',
          'Awesome! Did you check out the private 10-member group yet?',
          'Looks fantastic! The Material design feels completely native.',
          'Love the custom Noor Chat emblem and dark emerald styling! ✨',
        ];
        const randomReply = peerReplies[Math.floor(Math.random() * peerReplies.length)];
        onSendMessage({
          senderId: peer.id,
          senderName: peer.name,
          senderAvatar: peer.avatar,
          recipientId: currentUser.id,
          type: 'text',
          content: randomReply,
        });
        playNotificationSound();
      }, 2000);
    }, 1000);
  };

  // Image Upload File Handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewMediaUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Document Upload File Handler
  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = `${(file.size / 1024).toFixed(0)} KB`;
    onSendMessage({
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId: peer.id,
      type: 'file',
      content: file.name,
      mediaName: file.name,
      mediaSize: sizeFormatted,
    });
    playSentSound();
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Top Android App Bar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-2">
          <button
            id="btn-back-to-chats"
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative cursor-pointer" onClick={() => onStartCall('video')}>
            <img
              src={peer.avatar}
              alt={peer.name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-emerald-500/40"
            />
            {peer.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
            )}
          </div>

          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm text-white flex items-center gap-1.5">
              {peer.name}
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">
              {isPeerTyping ? 'typing...' : peer.online ? 'Online' : peer.lastSeen || 'Offline'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Audio Call, Video Call */}
        <div className="flex items-center gap-1">
          <button
            id="btn-start-audio-call"
            onClick={() => onStartCall('audio')}
            className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            title="Start Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            id="btn-start-video-call"
            onClick={() => onStartCall('video')}
            className="p-2 rounded-full hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            title="Start HD Video Call"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scrollable List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Security E2E Notice */}
        <div className="flex justify-center my-2">
          <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-500/20 text-[10px] text-emerald-300/80 font-medium tracking-wide flex items-center gap-1.5">
            <span>🔒</span>
            <span>Messages and calls are end-to-end encrypted.</span>
          </div>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`relative max-w-[82%] sm:max-w-[75%] rounded-2xl p-3 shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700/50'
                }`}
              >
                {/* Media: Image */}
                {msg.type === 'image' && msg.mediaUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden border border-black/20">
                    <img
                      src={msg.mediaUrl}
                      alt="shared"
                      className="w-full max-h-60 object-cover cursor-pointer hover:opacity-95 transition"
                      onClick={() => setActiveMediaModal(msg.mediaUrl!)}
                    />
                  </div>
                )}

                {/* Media: Voice Note */}
                {msg.type === 'audio' && (
                  <div className="flex items-center gap-3 min-w-[190px] py-1">
                    <button
                      onClick={() => handlePlayAudio(msg.id, msg.mediaUrl)}
                      className={`p-2 rounded-full cursor-pointer transition ${
                        isMe
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      {playingAudioId === msg.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 flex flex-col gap-1">
                      {/* Audio waveform simulated bars */}
                      <div className="flex items-center gap-0.5 h-6">
                        {[12, 22, 14, 28, 18, 30, 16, 24, 10, 26, 18, 20, 14].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full ${
                              playingAudioId === msg.id
                                ? 'bg-amber-300 animate-pulse'
                                : isMe
                                ? 'bg-emerald-300/80'
                                : 'bg-slate-400'
                            }`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono">
                        0:{(msg.audioDuration || 4).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Media: File / Document */}
                {msg.type === 'file' && (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/20 border border-white/10 mb-1">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-white">{msg.mediaName || msg.content}</p>
                      <p className="text-[10px] text-slate-300">{msg.mediaSize || 'PDF Document'}</p>
                    </div>
                    <a
                      href={msg.mediaUrl || '#'}
                      download={msg.mediaName || 'file'}
                      className="p-1 text-slate-300 hover:text-white"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {/* Text Content */}
                {msg.content && msg.type !== 'file' && msg.type !== 'audio' && (
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                )}

                {/* Timestamp & Status Checkmarks */}
                <div
                  className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${
                    isMe ? 'text-emerald-200/80' : 'text-slate-400'
                  }`}
                >
                  <span>{timeFormatted}</span>
                  {isMe && (
                    <span>
                      {msg.status === 'read' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-amber-300" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-3.5 h-3.5 text-slate-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </span>
                  )}
                </div>

                {/* Message Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className="absolute -bottom-2.5 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] shadow-sm">
                    {msg.reactions.map((r, i) => (
                      <span key={i} title={r.userName}>
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Reactions Bar on Hover/Tap */}
              <div className="hidden group-hover:flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs shadow-sm">
                {['❤️', '👍', '😂', '🔥'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onAddReaction(msg.id, emoji)}
                    className="hover:scale-125 transition-transform p-0.5"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Peer Typing Indicator Bubble */}
        {isPeerTyping && (
          <div className="flex items-center gap-1.5 p-2.5 rounded-2xl rounded-tl-none bg-slate-800/80 border border-slate-700/50 w-20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: '0.2s' }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Media Preview Attachment Bar */}
      {previewMediaUrl && (
        <div className="shrink-0 p-2 mx-3 mb-1 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={previewMediaUrl}
              alt="preview"
              className="w-12 h-12 rounded-lg object-cover border border-slate-700"
            />
            <span className="text-xs text-slate-300">Ready to send photo</span>
          </div>
          <button
            onClick={() => setPreviewMediaUrl(null)}
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="shrink-0 p-2 mx-3 mb-2 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap gap-2 shadow-2xl z-20">
          {EMOJI_LIST.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setInputText((prev) => prev + em)}
              className="p-1.5 text-lg hover:scale-125 transition-transform"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Bottom Input Field & Android Controls */}
      <div className="shrink-0 p-2.5 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80">
        {isRecording ? (
          /* Active Voice Recording Bar */
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-rose-300 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-semibold">Recording Voice Note...</span>
              <span className="font-mono text-xs font-bold text-white">
                0:{recordingSeconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stopVoiceRecording(false)}
                className="p-1.5 rounded-full hover:bg-rose-900/50 text-rose-400"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => stopVoiceRecording(true)}
                className="p-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
                title="Send Voice Note"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Standard Messaging Input Bar */
          <form onSubmit={handleSendText} className="flex items-center gap-1.5">
            {/* Emoji Button */}
            <button
              type="button"
              id="btn-toggle-emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              type="file"
              ref={docInputRef}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={handleDocSelect}
            />

            {/* Media Attachment Actions */}
            <button
              type="button"
              id="btn-attach-image"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              title="Attach Photo"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              id="btn-attach-doc"
              onClick={() => docInputRef.current?.click()}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              id="input-chat-message"
              placeholder="Message Noor Chat..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />

            {/* Send or Voice Note Button */}
            {inputText.trim() || previewMediaUrl ? (
              <button
                type="submit"
                id="btn-send-message"
                className="p-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/40 transition cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="btn-record-voice"
                onClick={startVoiceRecording}
                className="p-2.5 rounded-full bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 transition cursor-pointer active:scale-95"
                title="Hold or tap to record voice note"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </form>
        )}
      </div>

      {/* Fullscreen Photo Modal */}
      {activeMediaModal && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveMediaModal(null)}
        >
          <div className="relative max-w-lg max-h-[85vh]">
            <img
              src={activeMediaModal}
              alt="full preview"
              className="rounded-2xl max-w-full max-h-[85vh] object-contain shadow-2xl"
            />
            <button
              onClick={() => setActiveMediaModal(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
