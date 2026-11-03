import React, { useState } from 'react';
import { Share2, Smartphone, Globe, Copy, Check, ExternalLink, Download } from 'lucide-react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ais-pre-tfkiyn52tsrinwxhrflitv-751142737380.us-east1.run.app';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareFacebook = () => {
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent('Play Zen Tile Match 3D & win real cash prizes!')}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=500');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Zen Tile Match 3D',
          text: 'Play Zen Tile Match 3D on mobile! Match tiles & bubbles with legit prize rewards.',
          url: shareUrl
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-950 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5 font-display">
                Publish & Social Share
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-sans font-medium">
                  Public Live
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Share to Facebook, Android Google Play Store & Web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Public Access Notice: No Gmail or Login Required */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
            <span className="text-lg">🌐</span>
            <div className="text-xs">
              <span className="font-bold text-emerald-300 block">100% Public Access · No Gmail or Login Required</span>
              <p className="text-stone-300/90 text-[11px] mt-0.5 leading-relaxed">
                This game is completely public! Anyone who taps your link or opens it from Facebook or Google Play Store can play immediately without entering an email, password, or Gmail account.
              </p>
            </div>
          </div>

          {/* 1. Facebook 1-Click Share Button */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📘</span>
                <div>
                  <h3 className="text-sm font-bold text-white">Share to Facebook</h3>
                  <p className="text-[11px] text-blue-200/80">
                    Instantly share your game link to your Facebook feed or friends
                  </p>
                </div>
              </div>
              <button
                onClick={handleShareFacebook}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Share Post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Direct Public Web Link Copy */}
          <div>
            <label className="text-xs font-semibold text-stone-300 block mb-1.5">
              Public Shareable Web URL (Playable on any device)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-stone-900 border border-white/10 text-stone-300 text-xs font-mono select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-xl border border-white/10 transition-colors flex items-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Native Mobile Share (WhatsApp, Instagram, Messages) */}
          <button
            onClick={handleNativeShare}
            className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-850 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Share via Phone Apps (WhatsApp / Messages / Instagram)</span>
          </button>

          {/* 4. Google Play Store Publishing & Android APK/TWA Packaging */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-emerald-500/20 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-bold text-white">Google Play Store & Android Install</h3>
                <p className="text-[11px] text-stone-400">
                  Ready for Android homescreen & Google Play Console distribution
                </p>
              </div>
            </div>

            <div className="space-y-2 text-[11px] text-stone-300">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2">
                <span className="font-bold text-emerald-400">Step 1:</span>
                <span>
                  <strong>Install to Phone Now:</strong> Open this URL in Chrome on Android or Safari on iOS, tap the browser menu (⋮) and tap <strong>"Add to Home Screen"</strong> to run as a full-screen native app!
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2">
                <span className="font-bold text-emerald-400">Step 2:</span>
                <span>
                  <strong>Google Play Store APK:</strong> Use Google's official <code className="text-amber-300">@bubblewrap/cli</code> or <code className="text-amber-300">PWABuilder.com</code> to package this exact live URL into an Android App Bundle (<code className="text-emerald-400">.aab</code>).
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start gap-2">
                <span className="font-bold text-emerald-400">Step 3:</span>
                <span>
                  <strong>Upload to Play Console:</strong> Log into <a href="https://play.google.com/console" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">play.google.com/console</a> and upload the generated bundle for review!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
