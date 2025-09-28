import React, { useState, useMemo } from 'react';
import { Copy, Download, Upload, Settings, Zap, Shield, Globe, Code, FileText, Sparkles } from 'lucide-react';
import { sanitizeText, PRESET_PROFILES, SanitizerProfile } from './utils/sanitizer';

type PresetMode = 'emoji-safe' | 'max-sterile' | 'markup-intact' | 'thai-khmer' | 'arabic-indic';

const PRESET_CONFIGS: Record<PresetMode, { profile: SanitizerProfile; lang?: string; name: string; description: string; icon: React.ReactNode }> = {
  'emoji-safe': {
    profile: PRESET_PROFILES.EMOJI_SAFE,
    name: 'Emoji Safe',
    description: 'Preserves emoji presentation while cleaning invisible characters',
    icon: <Sparkles className="w-5 h-5" />
  },
  'max-sterile': {
    profile: PRESET_PROFILES.MAX_STERILE,
    name: 'Max Sterile',
    description: 'Maximum cleaning for archival and security purposes',
    icon: <Shield className="w-5 h-5" />
  },
  'markup-intact': {
    profile: PRESET_PROFILES.MARKUP_INTACT,
    name: 'Markup Intact',
    description: 'Cleans Unicode while preserving HTML/Markdown formatting',
    icon: <Code className="w-5 h-5" />
  },
  'thai-khmer': {
    profile: PRESET_PROFILES.EMOJI_SAFE,
    lang: 'th',
    name: 'Thai/Khmer',
    description: 'Preserves ZWSP for Thai/Khmer line-break hints',
    icon: <Globe className="w-5 h-5" />
  },
  'arabic-indic': {
    profile: PRESET_PROFILES.EMOJI_SAFE,
    lang: 'ar',
    name: 'Arabic/Indic',
    description: 'Preserves ZWJ/ZWNJ for proper text shaping',
    icon: <Globe className="w-5 h-5" />
  }
};

export default function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetMode>('emoji-safe');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customProfile, setCustomProfile] = useState<SanitizerProfile>(PRESET_PROFILES.EMOJI_SAFE);

  const currentConfig = PRESET_CONFIGS[selectedPreset];
  const profile = showAdvanced ? customProfile : currentConfig.profile;
  const lang = showAdvanced ? undefined : currentConfig.lang;

  const stats = useMemo(() => {
    if (!input || !output) return null;
    
    const originalLength = input.length;
    const cleanedLength = output.length;
    const removedChars = originalLength - cleanedLength;
    const invisibleChars = (input.match(/[\u200B-\u200D\u2060\u00AD\uFEFF]/g) || []).length;
    
    return {
      originalLength,
      cleanedLength,
      removedChars,
      invisibleChars,
      reductionPercent: originalLength > 0 ? ((removedChars / originalLength) * 100).toFixed(1) : '0'
    };
  }, [input, output]);

  const handleClean = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const cleaned = sanitizeText(input, profile, lang);
      setOutput(cleaned);
    } catch (error) {
      console.error('Failed to clean text:', error);
      setOutput('Error: Failed to clean text. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!output) return;
    
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (err) {
      console.error('Failed to paste text:', err);
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned-text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">ACE Paste Cleaner Pro</h1>
                <p className="text-slate-400 text-sm">Professional Unicode Text Sanitizer</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`btn-ghost ${showAdvanced ? 'bg-slate-800/50 text-slate-200' : ''}`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Advanced
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-200 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Input Text
                </h2>
                <button
                  onClick={pasteFromClipboard}
                  className="btn-ghost text-sm"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Paste
                </button>
              </div>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your text here to clean invisible characters, normalize Unicode, and sanitize content..."
                className="textarea-field w-full h-64"
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-400">
                  {input.length.toLocaleString()} characters
                </span>
                <button
                  onClick={handleClean}
                  disabled={!input.trim() || isProcessing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Clean Text
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preset Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Cleaning Presets</h3>
              <div className="space-y-3">
                {Object.entries(PRESET_CONFIGS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPreset(key as PresetMode)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                      selectedPreset === key
                        ? 'border-primary-500/50 bg-primary-500/10 text-primary-200'
                        : 'border-slate-600/50 bg-slate-800/30 text-slate-300 hover:border-slate-500/50 hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {config.icon}
                      <div>
                        <div className="font-medium">{config.name}</div>
                        <div className="text-sm text-slate-400">{config.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-200 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Cleaned Output
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyToClipboard}
                    disabled={!output}
                    className="btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={downloadOutput}
                    disabled={!output}
                    className="btn-ghost text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
              
              <textarea
                value={output}
                readOnly
                placeholder="Cleaned text will appear here..."
                className="textarea-field w-full h-64 bg-slate-900/50"
              />
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-slate-400">
                  {output.length.toLocaleString()} characters
                </span>
                {stats && (
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-400">
                      Removed: <span className="text-danger-400 font-medium">{stats.removedChars}</span> chars
                    </span>
                    <span className="text-slate-400">
                      Reduction: <span className="text-warning-400 font-medium">{stats.reductionPercent}%</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="card">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Cleaning Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-400">{stats.originalLength.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Original</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success-400">{stats.cleanedLength.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Cleaned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-danger-400">{stats.removedChars.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Removed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning-400">{stats.invisibleChars}</div>
                    <div className="text-sm text-slate-400">Invisible</div>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="card">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">What Gets Cleaned</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-danger-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Zero-width characters (ZWSP, ZWNJ, ZWJ)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-danger-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Bidirectional controls (LRM, RLM, etc.)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-danger-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Soft hyphens and discretionary breaks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-danger-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">TAG characters and non-characters</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Variation selectors (except emoji)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Private use area characters</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Isolated combining marks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-warning-400 rounded-full"></div>
                    <span className="text-sm text-slate-300">Control characters and surrogates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
