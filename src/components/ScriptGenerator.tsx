import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, 
  Flame, 
  BookOpen, 
  Lightbulb, 
  Mic, 
  History,
  Volume2,
  RefreshCw,
  Save,
  ChevronRight,
  BarChart3,
  BrainCircuit,
  FileText,
  Sparkles,
  ArrowRight,
  Tag,
  MessageSquare,
  Star,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import ReactSlider from 'react-slider';
import { useSpring, animated } from '@react-spring/web';
import { api } from '../utils/api';

const SCRIPT_STYLES = [
  { id: 'viral', name: '🔥 Viral Hook', icon: Flame, description: 'MrBeast-style attention-grabbing intro' },
  { id: 'educational', name: '📚 Educational', icon: BookOpen, description: 'Ali Abdaal-style structured breakdown' },
  { id: 'motivational', name: '💡 Motivational', icon: Lightbulb, description: 'Inspirational storytelling' },
  { id: 'podcast', name: '🎙️ Podcast-Style', icon: Mic, description: 'Casual & conversational' },
];

interface ScriptVersion {
  content: string;
  timestamp: Date;
  style: string;
  metrics: {
    engagement: number;
    retention: number;
    readability: number;
  };
}

interface ScriptOutline {
  title: string;
  sections: {
    title: string;
    content: string;
    metrics?: {
      engagement: number;
      emotionalImpact: number;
      clarity: number;
    };
  }[];
}

interface ScriptSuggestion {
  title: string;
  description: string;
  outline: ScriptOutline;
  predictedEngagement: number;
}

interface SectionMetrics {
  engagement: number;
  emotionalImpact: number;
  clarity: number;
}

export function ScriptGenerator() {
  const [activeStep, setActiveStep] = useState<'brainstorm' | 'outline' | 'script'>('brainstorm');
  const [brainstormNotes, setBrainstormNotes] = useState('');
  const [suggestedPaths, setSuggestedPaths] = useState<ScriptSuggestion[]>([]);
  const [selectedPath, setSelectedPath] = useState<ScriptSuggestion | null>(null);
  const [scriptOutline, setScriptOutline] = useState<ScriptOutline | null>(null);
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [scriptVersions, setScriptVersions] = useState<ScriptVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [toneLevel, setToneLevel] = useState(50);
  const [isImproving, setIsImproving] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState({
    engagement: 85,
    retention: 78,
    readability: 92,
  });
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [sectionMetrics, setSectionMetrics] = useState<SectionMetrics[]>([]);

  const progressSpring = useSpring({
    width: loading ? '100%' : '0%',
    config: { duration: 2000 },
  });

  const analyzeBrainstorm = async () => {
    setAnalyzing(true);
    try {
      const result = await api.brainstorm(brainstormNotes, topic);
      setSuggestedPaths(result.suggestions);
    } catch (error) {
      console.error('Brainstorm error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePathSelection = (path: ScriptSuggestion) => {
    setSelectedPath(path);
    setScriptOutline(path.outline);
    setSectionMetrics(path.outline.sections.map(section => ({
      engagement: section.metrics?.engagement || 85,
      emotionalImpact: section.metrics?.emotionalImpact || 80,
      clarity: section.metrics?.clarity || 85
    })));
    setActiveStep('outline');
  };

  const improveSection = async (sectionIndex: number) => {
    setIsImproving(true);
    try {
      const section = scriptOutline!.sections[sectionIndex];
      const result = await api.improveSection(
        { title: section.title, content: section.content },
        topic
      );
      const newOutline = { ...scriptOutline! };
      newOutline.sections[sectionIndex] = {
        title: result.title,
        content: result.content,
        metrics: result.metrics,
      };
      setScriptOutline(newOutline);
    } catch (error) {
      console.error('Improve section error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const generateScript = async () => {
    setLoading(true);
    setGeneratedScript('');
    try {
      const result = await api.generateScript(topic, selectedStyle, scriptOutline, toneLevel);
      setGeneratedScript(result.script);
      setSuggestedKeywords(result.keywords || []);

      const newVersion: ScriptVersion = {
        content: result.script,
        timestamp: new Date(),
        style: selectedStyle,
        metrics: result.metrics,
      };
      setScriptVersions(prev => [newVersion, ...prev]);
      setCurrentMetrics(result.metrics);
      setActiveStep('script');
    } catch (error) {
      console.error('Generate error:', error);
    } finally {
      setLoading(false);
    }
  };

  const improveScript = async () => {
    setIsImproving(true);
    try {
      const result = await api.improveScript(generatedScript);
      setGeneratedScript(result.script);
      setCurrentMetrics(result.metrics);

      const newVersion: ScriptVersion = {
        content: result.script,
        timestamp: new Date(),
        style: selectedStyle,
        metrics: result.metrics,
      };
      setScriptVersions(prev => [newVersion, ...prev]);
    } catch (error) {
      console.error('Improve error:', error);
    } finally {
      setIsImproving(false);
    }
  };

  const renderMetricsGauge = (value: number, label: string) => (
    <div className="relative w-full h-2 bg-dark-800 rounded-full overflow-hidden">
      <div 
        className="absolute top-0 left-0 h-full bg-accent-primary rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
      <div className="absolute -top-6 left-0 text-xs text-gray-400">{label}</div>
      <div className="absolute -top-6 right-0 text-xs text-white">{value}%</div>
    </div>
  );

  const renderSectionMetrics = (metrics: SectionMetrics) => (
    <div className="space-y-4 mt-4">
      {renderMetricsGauge(metrics.engagement, 'Engagement')}
      {renderMetricsGauge(metrics.emotionalImpact, 'Emotional Impact')}
      {renderMetricsGauge(metrics.clarity, 'Clarity')}
    </div>
  );

  const playAudioPreview = () => {
    // Simulate audio playback
    console.log('Playing audio preview...');
  };

  const renderBrainstormStep = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Brain Dump Your Ideas
        </label>
        <textarea
          value={brainstormNotes}
          onChange={(e) => setBrainstormNotes(e.target.value)}
          placeholder="Write your unstructured thoughts, ideas, and notes here..."
          className="w-full h-48 input-field resize-none"
        />
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={analyzeBrainstorm}
        disabled={!brainstormNotes.trim() || analyzing}
        className="primary-button w-full justify-center"
      >
        {analyzing ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <BrainCircuit className="w-4 h-4" />
            Analyze & Suggest Paths
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {suggestedPaths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-white">Suggested Approaches</h3>
            <div className="grid grid-cols-1 gap-4">
              {suggestedPaths.map((path, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePathSelection(path)}
                  className="glass-panel p-4 text-left hover:shadow-glow transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-white flex items-center gap-2">
                        {path.title}
                        <span className="text-accent-primary text-sm flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          {path.predictedEngagement}% Engagement
                        </span>
                      </h4>
                      <p className="mt-1 text-sm text-gray-400">{path.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-accent-primary" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderOutlineStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Script Outline</h3>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateScript}
          className="primary-button"
        >
          <FileText className="w-4 h-4" />
          Generate Full Script
        </motion.button>
      </div>

      {scriptOutline && (
        <div className="space-y-4">
          <div className="glass-panel p-4">
            <h4 className="font-medium text-white">{scriptOutline.title}</h4>
          </div>
          {scriptOutline.sections.map((section, index) => (
            <motion.div 
              key={index} 
              className={`glass-panel p-4 ${selectedSection === index ? 'ring-2 ring-accent-primary' : ''}`}
              onClick={() => setSelectedSection(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h5 className="font-medium text-white mb-2">{section.title}</h5>
                  <p className="text-sm text-gray-400">{section.content}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => improveSection(index)}
                  className="p-2 glass-button ml-4"
                  disabled={isImproving}
                >
                  <Wand2 className={`w-4 h-4 ${isImproving ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>
              
              {section.metrics && (
                <div className="mt-4 pt-4 border-t border-dark-700/50">
                  {renderSectionMetrics(section.metrics)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderScriptStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Generated Script</h3>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={playAudioPreview}
            className="p-2 glass-button"
            title="Preview Audio"
          >
            <Volume2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={improveScript}
            className="p-2 glass-button"
            title="Improve Script"
          >
            <RefreshCw className={`w-4 h-4 ${isImproving ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMetrics(!showMetrics)}
            className="p-2 glass-button"
            title="Show Metrics"
          >
            <BarChart3 className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowVersions(!showVersions)}
            className="p-2 glass-button"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 glass-button"
            title="Save Script"
          >
            <Save className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showMetrics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-6"
          >
            <h4 className="text-sm font-medium text-white mb-4">Script Performance Metrics</h4>
            <div className="space-y-6">
              {renderMetricsGauge(currentMetrics.engagement, 'Overall Engagement')}
              {renderMetricsGauge(currentMetrics.retention, 'Predicted Retention')}
              {renderMetricsGauge(currentMetrics.readability, 'Readability Score')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-panel p-4">
        <TypeAnimation
          sequence={[generatedScript]}
          wrapper="pre"
          cursor={true}
          repeat={0}
          speed={50}
          className="text-gray-300 whitespace-pre-wrap font-mono text-sm"
        />
      </div>

      {suggestedKeywords.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Suggested Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {suggestedKeywords.map((keyword, index) => (
              <div
                key={index}
                className="px-3 py-1 rounded-full bg-dark-800 text-sm text-gray-300 flex items-center gap-1"
              >
                <Tag className="w-3 h-3" />
                {keyword}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showVersions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel p-4"
          >
            <h4 className="text-sm font-medium text-white mb-4">Version History</h4>
            <div className="space-y-2">
              {scriptVersions.map((version, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setGeneratedScript(version.content)}
                  className="w-full glass-button p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Version {scriptVersions.length - index}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {version.timestamp.toLocaleTimeString()}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <span className="text-xs text-accent-primary">
                      Engagement: {version.metrics.engagement}%
                    </span>
                    <span className="text-xs text-accent-secondary">
                      Retention: {version.metrics.retention}%
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">AI Script Generator</h1>
        <p className="mt-1 text-sm text-gray-400">Create engaging video scripts with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 glass-panel p-6"
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-300">
                Video Topic
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to invest in stocks for beginners"
                className="mt-1 w-full input-field"
              />
            </div>

            <div className="flex gap-4 mb-6">
              {(['brainstorm', 'outline', 'script'] as const).map((step) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  disabled={
                    (step === 'outline' && !selectedPath) ||
                    (step === 'script' && !generatedScript)
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStep === step 
                      ? 'bg-accent-primary text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </button>
              ))}
            </div>

            {activeStep === 'brainstorm' && renderBrainstormStep()}
            {activeStep === 'outline' && renderOutlineStep()}
            {activeStep === 'script' && renderScriptStep()}
          </div>
        </motion.div>

        <AnimatePresence>
          {showVersions && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="glass-panel p-6 h-fit"
            >
              <h3 className="text-lg font-medium text-white mb-4">Version History</h3>
              <div className="space-y-4">
                {scriptVersions.map((version, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="w-full glass-button p-4 text-left"
                    onClick={() => setGeneratedScript(version.content)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Version {scriptVersions.length - index}</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {version.timestamp.toLocaleTimeString()}
                    </p>
                    <div className="mt-2 text-xs text-gray-400">
                      Style: {SCRIPT_STYLES.find(s => s.id === version.style)?.name}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}