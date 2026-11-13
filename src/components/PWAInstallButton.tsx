import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Apple, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'card' }> = ({
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guidePlatform, setGuidePlatform] = useState<'ios' | 'android' | 'desktop'>('ios');

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        // User dismissed or browser fell back; show instructions
        setGuidePlatform(isIOS ? 'ios' : 'desktop');
        setShowGuideModal(true);
      }
    } else if (isIOS) {
      setGuidePlatform('ios');
      setShowGuideModal(true);
    } else {
      setGuidePlatform('desktop');
      setShowGuideModal(true);
    }
  };

  const buttonContent = (
    <>
      <Download className="w-4 h-4 text-[#CCFF00]" />
      <span>Install App</span>
    </>
  );

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1F3D] hover:bg-[#162B55] text-xs font-semibold text-white border border-[#CCFF00]/40 transition-all shadow-sm active:scale-95"
          aria-label="Install KHELO LPU Progressive Web App"
        >
          {buttonContent}
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-[#0F1F3D] to-[#0A162B] border border-[#CCFF00]/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3 text-left">
            <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-6 h-6 text-[#CCFF00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">KHELO LPU Progressive Web App</span>
                <span className="px-2 py-0.5 text-[10px] uppercase font-black bg-[#CCFF00] text-black rounded-full">Offline Ready</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Install on your Android, iOS, or PC home screen for fast court reservations, offline passes, and instant match push alerts.
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Install KHELO LPU
          </button>
        </div>
      )}

      {/* Installation Instructions Modal for iOS / Desktop Fallbacks */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-[#0D172A] border border-slate-700 p-6 shadow-2xl text-slate-100">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/60"
              aria-label="Close installation guide"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 id="pwa-install-title" className="text-lg font-bold text-white">
                  Install KHELO LPU
                </h3>
                <p className="text-xs text-slate-400">Progressive Web App (PWA) Guide</p>
              </div>
            </div>

            {/* Platform Selector Tabs */}
            <div className="flex rounded-lg bg-slate-800/80 p-1 mb-5 text-xs">
              <button
                onClick={() => setGuidePlatform('ios')}
                className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1.5 transition ${
                  guidePlatform === 'ios'
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                iOS Safari
              </button>
              <button
                onClick={() => setGuidePlatform('android')}
                className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1.5 transition ${
                  guidePlatform === 'android'
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Android
              </button>
              <button
                onClick={() => setGuidePlatform('desktop')}
                className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1.5 transition ${
                  guidePlatform === 'desktop'
                    ? 'bg-[#CCFF00] text-black shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Desktop
              </button>
            </div>

            {/* Step-by-step instructions */}
            {guidePlatform === 'ios' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-semibold text-white">Open in Safari</span>
                    <p className="text-slate-400 mt-0.5">Ensure you are browsing KHELO LPU in Apple Safari on your iPhone or iPad.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-semibold text-white">Tap Share Button</span>
                    <p className="text-slate-400 mt-0.5">Tap the Share icon (square with upward arrow) in the Safari navigation bar at the bottom.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <span className="font-semibold text-white">Select "Add to Home Screen"</span>
                    <p className="text-slate-400 mt-0.5">Scroll through the share options and tap <strong>Add to Home Screen</strong>, then tap <strong>Add</strong>.</p>
                  </div>
                </div>
              </div>
            )}

            {guidePlatform === 'android' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-semibold text-white">Chrome Menu or Install Banner</span>
                    <p className="text-slate-400 mt-0.5">Tap the 3-dot menu button in Google Chrome (or click the "Install App" button above).</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-semibold text-white">Tap "Install App" / "Add to Home screen"</span>
                    <p className="text-slate-400 mt-0.5">Confirm the prompt to install the standalone KHELO LPU icon on your Android launcher.</p>
                  </div>
                </div>
              </div>
            )}

            {guidePlatform === 'desktop' && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <span className="font-semibold text-white">Browser Address Bar Icon</span>
                    <p className="text-slate-400 mt-0.5">In Chrome or Edge, look for the computer monitor / install icon inside the right side of the URL address bar.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                  <span className="w-5 h-5 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <span className="font-semibold text-white">Click "Install"</span>
                    <p className="text-slate-400 mt-0.5">KHELO LPU will open in its own distraction-free desktop window with taskbar pinning.</p>
                  </div>
                </div>
              </div>
            )}

            {/* PWA Standard Notice */}
            <div className="mt-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#CCFF00] shrink-0 mt-0.5" />
              <span>
                <strong>PWA Standard Notice:</strong> KHELO LPU installs as a standards-compliant Progressive Web App with offline service worker caching. It does not generate an Android APK file or App Store binary package.
              </span>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
            >
              Got it, close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
