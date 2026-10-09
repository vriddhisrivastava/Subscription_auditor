import React, { useState } from 'react';
import {
  parseCSVBankStatement,
  DetectedSubscriptionItem,
  SAMPLE_CSV_CONTENT,
} from '../lib/csvParser';
import { SubscriptionCategory, CATEGORY_INFO, BillingCycle } from '../types/subscription';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: DetectedSubscriptionItem[]) => Promise<void>;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [detectedItems, setDetectedItems] = useState<DetectedSubscriptionItem[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  const handleParse = (text: string) => {
    setCsvText(text);
    const items = parseCSVBankStatement(text);
    setDetectedItems(items);
    setHasParsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        handleParse(content);
      };
      reader.readAsText(file);
    }
  };

  const handleLoadSample = () => {
    handleParse(SAMPLE_CSV_CONTENT);
  };

  const toggleSelect = (id: string) => {
    setDetectedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleAll = (select: boolean) => {
    setDetectedItems(prev => prev.map(item => ({ ...item, selected: select })));
  };

  const handleConfirmImport = async () => {
    const selected = detectedItems.filter(i => i.selected);
    if (selected.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(selected);
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = detectedItems.filter(i => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card shadow-2xl p-6 sm:p-8 overflow-hidden my-8 z-10 text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              // DATA INGESTION ENGINE
            </div>
            <h3 className="font-editorial text-xl sm:text-2xl font-bold uppercase tracking-tight text-foreground flex items-center gap-2">
              Import Statement CSV
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
              Ingest raw ledger files to parse recurring vendor subscriptions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {!hasParsed ? (
          <div className="mt-5 space-y-4">
            {/* Drop / Upload zone */}
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors bg-muted/20">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold text-sm text-foreground">
                Choose a CSV bank statement file
              </h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Supports exports from Chase, Amex, Capital One, Wells Fargo, Apple Card, or any CSV
                with Date, Description, and Amount columns.
              </p>

              <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs">
                <span>Browse Files</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick Demo Statement */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="w-4 h-4" />
                  No file on hand?
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Load a sample statement with 10 typical recurring charges (Netflix, OpenAI,
                  Spotify, Equinox, NYTimes, etc.)
                </div>
              </div>
              <button
                onClick={handleLoadSample}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-primary/40 bg-background text-primary hover:bg-primary/10 transition-colors shrink-0"
              >
                Load Sample CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="font-medium text-foreground">
                Detected {detectedItems.length} recurring candidates ({selectedCount} selected)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAll(true)}
                  className="text-primary hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => toggleAll(false)}
                  className="text-muted-foreground hover:underline"
                >
                  Deselect All
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => setHasParsed(false)}
                  className="text-muted-foreground hover:underline"
                >
                  Upload Different File
                </button>
              </div>
            </div>

            {/* Detected items list */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border/60 border border-border/80 rounded-xl bg-background/50">
              {detectedItems.map(item => {
                const cat = CATEGORY_INFO[item.category] || CATEGORY_INFO.OTHER;
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      item.selected ? 'bg-primary/5' : 'hover:bg-muted/40 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => {}}
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground truncate">
                            {item.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${cat.bg}`}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate mt-0.5">
                          Statement text: "{item.rawMerchant}"
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-foreground">
                        ₹{item.cost.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-muted-foreground block capitalize">
                        {item.billingCycle.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                // Triggers algorithmic recalculation upon ingest
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-full border border-border hover:border-foreground text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedCount === 0 || isImporting}
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 text-xs font-mono uppercase tracking-wider font-bold rounded-full bg-foreground text-background hover:opacity-90 transition-opacity shadow-xs disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <span>
                    {isImporting ? 'Ingesting...' : `Import ${selectedCount} Subscriptions`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
