import { useEffect } from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';
import { PROFILE_DATA, TIMELINE_DATA } from '@/data/portfolioData';
import { soundEngine } from '@/utils/soundEngine';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 md:p-8"
      onClick={() => {
        soundEngine.playClick();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Resume Preview"
    >
      <div
        className="relative w-full max-w-5xl h-[86vh] bg-cream text-ink border-2 border-ink flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink px-5 py-3.5 bg-ink text-cream">
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4" />
            <span className="font-mono text-sm uppercase tracking-widest font-bold">
              {PROFILE_DATA.name} // OFFICIAL RESUME
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={PROFILE_DATA.resumeUrl}
              download="Sujay_Paul_P_Resume.pdf"
              onClick={() => soundEngine.playClick()}
              className="flex items-center gap-1.5 border border-cream px-3 py-1 text-xs font-mono uppercase tracking-wider hover:bg-cream hover:text-ink transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
            <a
              href={PROFILE_DATA.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => soundEngine.playClick()}
              className="flex items-center gap-1.5 border border-cream px-3 py-1 text-xs font-mono uppercase tracking-wider hover:bg-cream hover:text-ink transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Full Tab
            </a>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              aria-label="Close resume preview"
              className="border border-cream p-1 hover:bg-cream hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Content: Embedded PDF + Quick Interactive Timeline Summary */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          <div className="lg:col-span-7 h-full border-b lg:border-b-0 lg:border-r border-ink bg-neutral-900">
            <iframe
              src={`${PROFILE_DATA.resumeUrl}#toolbar=0&navpanes=0`}
              title="Sujay Paul P Resume PDF"
              className="w-full h-full border-0"
            />
          </div>

          <div className="lg:col-span-5 h-full overflow-y-auto p-6 font-mono text-xs space-y-5 bg-cream text-ink">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider border-b border-ink pb-1.5">
                {PROFILE_DATA.name}
              </h3>
              <p className="mt-2 leading-relaxed opacity-85">
                {PROFILE_DATA.heroSubtitle}
              </p>
              <div className="mt-2 opacity-75">
                {PROFILE_DATA.email} | {PROFILE_DATA.phone}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-widest border-b border-ink pb-1">
                Experience &amp; Education Timeline
              </h4>
              {TIMELINE_DATA.map((item) => (
                <div key={item.id} className="border-l-2 border-ink pl-3 space-y-1">
                  <div className="text-[11px] opacity-70">{item.period}</div>
                  <div className="font-bold text-sm">{item.title}</div>
                  <div className="italic opacity-80">
                    {item.organization} — {item.location}
                  </div>
                  <ul className="list-disc list-inside space-y-1 pt-1 opacity-85">
                    {item.highlights.map((h, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
