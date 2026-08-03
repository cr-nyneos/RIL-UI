import type { Dispatch, SetStateAction } from 'react';
import { CheckCircle2, CloudUpload, FileText } from 'lucide-react';

import CardHeader from '../../components/ui/CardHeader';
import GlassCard from '../../components/ui/GlassCard';
import { REQUIRED_DOCUMENTS, STEP_COPY } from './constants';

interface DocumentsTabProps {
  documents: Record<string, boolean>;
  setDocuments: Dispatch<SetStateAction<Record<string, boolean>>>;
  meaningfulChange: () => void;
}

export default function DocumentsTab({ documents, setDocuments, meaningfulChange }: DocumentsTabProps) {
  return (
    <GlassCard key="documents" className="animate-rise p-5" style={{ animationDelay: '80ms' }}>
      <CardHeader icon={CloudUpload} {...STEP_COPY.documents} />
      <label className="glass-inset mb-5 flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-glass-hairline-deep)] p-8 text-center transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--wash-brand-hover)]">
        <input
          type="file"
          multiple
          className="sr-only"
          onChange={() => {
            setDocuments(Object.fromEntries(REQUIRED_DOCUMENTS.map((document) => [document, true])));
            meaningfulChange();
          }}
        />
        <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-selected)] text-brand-700">
          <CloudUpload size={24} strokeWidth={2.2} />
        </span>
        <span className="text-body-strong">Upload contract package</span>
      </label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {REQUIRED_DOCUMENTS.map((document) => {
          const uploaded = documents[document];
          return (
            <button
              key={document}
              type="button"
              onClick={() => {
                setDocuments((current) => ({ ...current, [document]: !current[document] }));
                meaningfulChange();
              }}
              className="glass-inset flex min-h-[118px] cursor-pointer flex-col items-start justify-between p-5 text-left transition-colors duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--wash-brand-hover)]"
            >
              <span className="flex w-full items-center justify-between gap-3">
                <FileText size={18} strokeWidth={2.2} className="text-brand-700" />
                {uploaded ? <CheckCircle2 size={18} strokeWidth={2.4} className="text-success" /> : <CloudUpload size={18} strokeWidth={2.2} className="text-ink-500" />}
              </span>
              <span>
                <span className="block text-body-strong">{document}</span>
                <span className="mt-1 block text-meta">{uploaded ? 'Uploaded' : 'Required'}</span>
              </span>
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
