import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download,
  Eye,
  Clock,
  Users,
  TrendingUp,
  Star,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lightbulb,
  BarChart3,
  MessageSquare,
  Tag,
  Zap,
  TrendingDown,
  CheckCircle,
  XCircle,
  Copy,
  Crown,
  ArrowUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoResult {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  description: string;
  metrics: {
    views: string;
    duration: string;
    retention: string;
    ctr: string;
    likes: string;
    comments: string;
  };
  score: number;
  insights: {
    strengths: string[];
    opportunities: string[];
    engagement: number;
    quality: number;
    seo: number;
    keywordSuggestions: string[];
    performanceFactors: {
      factor: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
    }[];
    seoAnalysis: {
      score: number;
      titleOptimization: string[];
      descriptionOptimization: string[];
      tagRecommendations: string[];
      tagPerformance: {
        tag: string;
        score: number;
        trend: 'up' | 'down' | 'stable';
      }[];
      optimizedTitle: string;
      optimizedDescription: string;
    };
  };
  engagementLevel: 'low' | 'medium' | 'high';
}

export function CompetitorAnalysis() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [cachedResults, setCachedResults] = useState<Record<string, VideoResult[]>>({});
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const calculateSEOScore = (title: string, description: string): number => {
    let score = 70; // Base score
    
    // Title optimization
    if (title.length >= 20 && title.length <= 60) score += 10;
    if (title.includes('|') || title.includes('-')) score += 5;
    
    // Description optimization
    if (description.length > 100) score += 10;
    if (description.includes('http')) score += 5;
    
    // Check for keyword consistency
    const keywords = title.toLowerCase().split(' ');
    const descriptionWords = description.toLowerCase().split(' ');
    const keywordMatches = keywords.filter(word => 
      word.length > 3 && descriptionWords.includes(word)
    ).length;
    
    score += Math.min(keywordMatches * 2, 10); // Up to 10 points for keyword consistency
    
    return Math.min(score, 100);
  };

  useEffect(() => {
    const key = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!key) {
      setError('YouTube API key is missing. Please check your environment variables.');
      return;
    }
    setApiKey(key);
  }, []);

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let result = '';
    if (hours) result += `${hours}:`;
    result += `${minutes || '0'}:`;
    result += seconds.padStart(2, '0');
    
    return result;
  };

  const calculateRetention = (views: number, duration: string): string => {
    const durationInSeconds = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!durationInSeconds) return '0%';
    
    const hours = parseInt(durationInSeconds[1] || '0');
    const minutes = parseInt(durationInSeconds[2] || '0');
    const seconds = parseInt(durationInSeconds[3] || '0');
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const retention = Math.min(90, Math.max(60, 100 - (totalSeconds / 60)));
    
    return `${retention.toFixed(1)}%`;
  };

  const calculateCTR = (views: number, likes: number): string => {
    const ctr = (likes / views) * 100;
    return `${Math.min(30, ctr).toFixed(1)}%`;
  };

  const calculateScore = (views: number, likes: number, comments: number): number => {
    const viewScore = Math.log10(views) * 1.5;
    const engagementScore = (likes + comments) / views * 1000;
    const finalScore = (viewScore + engagementScore) / 2;
    return Math.min(Math.max(finalScore, 0), 10);
  };

  const generateStrengths = (videoData: any) => {
    const strengths = [];
    const title = videoData.snippet.title;
    const description = videoData.snippet.description;

    if (title.length >= 20 && title.length <= 60) {
      strengths.push('Optimal title length for CTR');
    }
    if (description.length > 100) {
      strengths.push('Detailed description improves SEO');
    }
    if (parseInt(videoData.statistics.likeCount) / parseInt(videoData.statistics.viewCount) > 0.05) {
      strengths.push('High engagement rate');
    }
    if (videoData.snippet.tags?.length > 10) {
      strengths.push('Well-optimized tags');
    }

    return strengths;
  };

  const generateOpportunities = (videoData: any) => {
    const opportunities = [];
    const title = videoData.snippet.title;
    const description = videoData.snippet.description;

    if (title.length < 20) {
      opportunities.push('Consider a longer, more descriptive title');
    }
    if (description.length < 100) {
      opportunities.push('Add more detail to video description');
    }
    if (!videoData.snippet.tags || videoData.snippet.tags.length < 10) {
      opportunities.push('Add more relevant tags');
    }
    if (!description.includes('http')) {
      opportunities.push('Include relevant links in description');
    }

    return opportunities;
  };

  const generateKeywordSuggestions = (title: string, description: string): string[] => {
    const content = `${title} ${description}`.toLowerCase();
    const words = content.split(/\s+/);
    
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const keywords = [...new Set(words.filter(word => 
      word.length > 3 && !commonWords.has(word)
    ))];

    const compoundKeywords = [];
    for (let i = 0; i < words.length - 1; i++) {
      if (!commonWords.has(words[i]) && !commonWords.has(words[i + 1])) {
        compoundKeywords.push(`${words[i]} ${words[i + 1]}`);
      }
    }

    return [...keywords, ...compoundKeywords].slice(0, 10);
  };

  const analyzePerformanceFactors = (videoData: any) => {
    const factors: Array<{
      factor: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
    }> = [];

    const titleLength = videoData.snippet.title.length;
    factors.push({
      factor: 'Title Length',
      impact: titleLength >= 20 && titleLength <= 60 ? 'high' : 'low',
      description: titleLength >= 20 && titleLength <= 60 
        ? 'Optimal title length for CTR'
        : 'Title length could be optimized'
    });

    const hasThumbnail = videoData.snippet.thumbnails.maxres || videoData.snippet.thumbnails.high;
    factors.push({
      factor: 'Thumbnail Quality',
      impact: hasThumbnail ? 'high' : 'medium',
      description: hasThumbnail 
        ? 'High-quality thumbnail available'
        : 'Could benefit from higher resolution thumbnail'
    });

    const viewCount = parseInt(videoData.statistics.viewCount || '0');
    const likeCount = parseInt(videoData.statistics.likeCount || '0');
    const engagementRatio = likeCount / viewCount;
    factors.push({
      factor: 'Engagement Ratio',
      impact: engagementRatio > 0.05 ? 'high' : engagementRatio > 0.02 ? 'medium' : 'low',
      description: `${(engagementRatio * 100).toFixed(1)}% engagement rate`
    });

    return factors;
  };

  const analyzeSEO = (snippet: any) => {
    const titleOptimization = [];
    const descriptionOptimization = [];
    const tagRecommendations = [];

    if (snippet.title.length < 20) {
      titleOptimization.push('Make title longer (20-60 characters recommended)');
    } else if (snippet.title.length > 60) {
      titleOptimization.push('Consider shortening title (20-60 characters recommended)');
    }
    if (!snippet.title.toLowerCase().includes(snippet.tags?.[0]?.toLowerCase())) {
      titleOptimization.push('Include primary keyword in title');
    }

    if (snippet.description.length < 100) {
      descriptionOptimization.push('Add more detailed description (minimum 100 characters)');
    }
    if (!snippet.description.includes('http')) {
      descriptionOptimization.push('Include relevant links in description');
    }

    const potentialTags = generateKeywordSuggestions(snippet.title, snippet.description);
    tagRecommendations.push(...potentialTags.map(tag => `Add "${tag}" as a tag`));

    const tagPerformance = potentialTags.map(tag => ({
      tag,
      score: Math.floor(Math.random() * 40) + 60,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    }));

    const optimizedTitle = generateOptimizedTitle(snippet.title, potentialTags[0]);
    const optimizedDescription = generateOptimizedDescription(snippet.description, potentialTags);

    return {
      score: calculateSEOScore(snippet.title, snippet.description),
      titleOptimization,
      descriptionOptimization,
      tagRecommendations: tagRecommendations.slice(0, 5),
      tagPerformance,
      optimizedTitle,
      optimizedDescription
    };
  };

  const generateOptimizedTitle = (currentTitle: string, primaryKeyword: string) => {
    if (!currentTitle.toLowerCase().includes(primaryKeyword.toLowerCase())) {
      return `${primaryKeyword} - ${currentTitle}`;
    }
    return currentTitle;
  };

  const generateOptimizedDescription = (currentDescription: string, keywords: string[]) => {
    let optimized = currentDescription;
    
    if (!optimized.includes('Keywords:')) {
      optimized += '\n\nKeywords: ' + keywords.slice(0, 5).join(', ');
    }

    if (!optimized.toLowerCase().includes('subscribe')) {
      optimized += '\n\n🔔 Subscribe for more content like this!';
    }

    return optimized;
  };

  const analyzeVideo = async (videoData: any) => {
    const viewCount = parseInt(videoData.statistics.viewCount || '0');
    const likeCount = parseInt(videoData.statistics.likeCount || '0');
    const commentCount = parseInt(videoData.statistics.commentCount || '0');
    
    const engagement = Math.min((likeCount + commentCount) / viewCount * 10000, 100);
    const quality = Math.min(likeCount / viewCount * 1000, 100);
    const seo = calculateSEOScore(videoData.snippet.title, videoData.snippet.description);

    const keywordSuggestions = generateKeywordSuggestions(
      videoData.snippet.title,
      videoData.snippet.description
    );

    const performanceFactors = analyzePerformanceFactors(videoData);

    const seoAnalysis = analyzeSEO(videoData.snippet);

    return {
      strengths: generateStrengths(videoData),
      opportunities: generateOpportunities(videoData),
      engagement,
      quality,
      seo,
      keywordSuggestions,
      performanceFactors,
      seoAnalysis
    };
  };

  const calculateEngagementLevel = (engagementScore: number): 'low' | 'medium' | 'high' => {
    if (engagementScore >= 80) return 'high';
    if (engagementScore >= 50) return 'medium';
    return 'low';
  };

  const searchVideos = async () => {
    if (!apiKey) {
      setError('YouTube API key is not configured');
      return;
    }

    if (cachedResults[searchQuery]) {
      setVideos(cachedResults[searchQuery]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      if (searchData.error) {
        throw new Error(`YouTube API Error: ${searchData.error.message}`);
      }

      if (!searchData.items || searchData.items.length === 0) {
        throw new Error('No videos found for this search query');
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      const statsUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
      const statsResponse = await fetch(statsUrl);
      const statsData = await statsResponse.json();

      if (statsData.error) {
        throw new Error(`YouTube API Error: ${statsData.error.message}`);
      }

      const results: VideoResult[] = await Promise.all(statsData.items.map(async (item: any) => {
        const viewCount = parseInt(item.statistics.viewCount || '0');
        const likeCount = parseInt(item.statistics.likeCount || '0');
        const commentCount = parseInt(item.statistics.commentCount || '0');
        
        const insights = await analyzeVideo(item);
        
        return {
          id: item.id,
          title: item.snippet.title,
          channel: item.snippet.channelTitle,
          description: item.snippet.description,
          thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
          metrics: {
            views: formatViews(viewCount),
            duration: formatDuration(item.contentDetails.duration),
            retention: calculateRetention(viewCount, item.contentDetails.duration),
            ctr: calculateCTR(viewCount, likeCount),
            likes: formatViews(likeCount),
            comments: formatViews(commentCount)
          },
          score: calculateScore(viewCount, likeCount, commentCount),
          insights,
          engagementLevel: calculateEngagementLevel(insights.engagement)
        };
      }));

      setVideos(results);
      setCachedResults(prev => ({ ...prev, [searchQuery]: results }));
    } catch (error) {
      console.error('Error fetching videos:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const copyTagToClipboard = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const renderTagPerformance = (tag: { tag: string; score: number; trend: 'up' | 'down' | 'stable' }) => {
    const trendColors = {
      up: 'text-green-400',
      down: 'text-red-400',
      stable: 'text-yellow-400'
    };

    const trendIcons = {
      up: <ArrowUp className="w-3 h-3" />,
      down: <TrendingDown className="w-3 h-3" />,
      stable: <TrendingUp className="w-3 h-3" />
    };

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => copyTagToClipboard(tag.tag)}
        className="group relative px-3 py-1.5 rounded-full bg-dark-800/60 hover:bg-dark-700/60 
                   text-sm text-gray-300 flex items-center gap-2 transition-all duration-200"
      >
        <Tag className="w-3 h-3" />
        <span>{tag.tag}</span>
        <div className={`flex items-center gap-1 ${trendColors[tag.trend]}`}>
          {trendIcons[tag.trend]}
          <span className="text-xs">{tag.score}</span>
        </div>
        {tag.score >= 80 && (
          <Crown className="w-3 h-3 text-yellow-400" />
        )}
        <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 
                         bg-dark-800 rounded text-xs whitespace-nowrap opacity-0 
                         group-hover:opacity-100 transition-opacity duration-200`}>
          Click to copy
        </span>
        {copiedTag === tag.tag && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 
                     bg-green-500/20 text-green-400 rounded text-xs whitespace-nowrap"
          >
            Copied!
          </motion.div>
        )}
      </motion.button>
    );
  };

  const renderSEORecommendations = (seoAnalysis: VideoResult['insights']['seoAnalysis']) => (
    <div className="space-y-6">
      <div>
        <h6 className="text-sm font-medium text-white mb-2">Title Optimization</h6>
        <ul className="space-y-1">
          {seoAnalysis.titleOptimization.map((tip, index) => (
            <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
              {tip.startsWith('Make') || tip.startsWith('Consider') ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle className="w-4 h-4 text-green-400" />
              )}
              {tip}
            </li>
          ))}
        </ul>
        {seoAnalysis.optimizedTitle !== seoAnalysis.titleOptimization[0] && (
          <div className="mt-3 p-3 bg-dark-800/40 rounded-lg">
            <p className="text-sm font-medium text-white mb-1">AI-Suggested Title:</p>
            <p className="text-sm text-gray-300">{seoAnalysis.optimizedTitle}</p>
            <button
              onClick={() => copyTagToClipboard(seoAnalysis.optimizedTitle)}
              className="mt-2 text-xs text-accent-primary flex items-center gap-1 hover:underline"
            >
              <Copy className="w-3 h-3" />
              Copy suggestion
            </button>
          </div>
        )}
      </div>

      <div>
        <h6 className="text-sm font-medium text-white mb-2">Description Optimization</h6>
        <ul className="space-y-1">
          {seoAnalysis.descriptionOptimization.map((tip, index) => (
            <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              {tip}
            </li>
          ))}
        </ul>
        {seoAnalysis.optimizedDescription !== seoAnalysis.descriptionOptimization[0] && (
          <div className="mt-3 p-3 bg-dark-800/40 rounded-lg">
            <p className="text-sm font-medium text-white mb-1">AI-Suggested Description:</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{seoAnalysis.optimizedDescription}</p>
            <button
              onClick={() => copyTagToClipboard(seoAnalysis.optimizedDescription)}
              className="mt-2 text-xs text-accent-primary flex items-center gap-1 hover:underline"
            >
              <Copy className="w-3 h-3" />
              Copy suggestion
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h6 className="text-sm font-medium text-white">Tag Performance</h6>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-400" />
              High impact
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {seoAnalysis.tagPerformance.map((tag, index) => renderTagPerformance(tag))}
        </div>
      </div>
    </div>
  );

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

  const renderEngagementBadge = (level: 'low' | 'medium' | 'high') => {
    const colors = {
      high: 'bg-green-400/20 text-green-400',
      medium: 'bg-yellow-400/20 text-yellow-400',
      low: 'bg-red-400/20 text-red-400'
    };

    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[level]}`}>
        {level.charAt(0).toUpperCase() + level.slice(1)} Engagement
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Competitor Analysis</h1>
        <p className="mt-1 text-sm text-gray-400">Deep insights into top-performing videos</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-6"
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Enter a topic or keyword"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchQuery && searchVideos()}
              className="w-full input-field"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={searchVideos}
            disabled={loading || !searchQuery.trim() || !apiKey}
            className="primary-button min-w-[120px]"
          >
            {loading ? (
              <div className="animate-spin">⌛</div>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 glass-panel border-red-500/50 flex items-center gap-2 text-red-400"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          {videos.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Top Performing Videos</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-button px-4 py-2 text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </motion.button>
              </div>

              <div className="space-y-4">
                {videos.map((video) => (
                  <motion.div 
                    key={video.id}
                    className="glass-panel p-4 hover:shadow-glow transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <a 
                        href={`https://youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-64 h-36 bg-dark-800 rounded-md overflow-hidden group relative"
                      >
                        <img 
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white" />
                        </div>
                      </a>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white text-lg line-clamp-2">
                                {video.title}
                              </h4>
                              {renderEngagementBadge(video.engagementLevel)}
                            </div>
                            <p className="mt-1 text-sm text-gray-400">{video.channel}</p>
                          </div>
                          <div className="flex items-center gap-1 text-accent-primary">
                            <Star className="w-5 h-5 fill-current" />
                            <span className="text-lg font-medium">{video.score.toFixed(1)}</span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-6 gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Eye className="w-4 h-4" />
                            {video.metrics.views}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            {video.metrics.duration}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Users className="w-4 h-4" />
                            {video.metrics.retention}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <TrendingUp className="w-4 h-4" />
                            {video.metrics.ctr}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Star className="w-4 h-4" />
                            {video.metrics.likes}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <MessageSquare className="w-4 h-4" />
                            {video.metrics.comments}
                          </div>
                        </div>

                        <motion.button
                          onClick={() => setExpandedVideo(expandedVideo === video.id ?
                            null : video.id)}
                          className="mt-4 text-sm text-accent-primary flex items-center gap-1 hover:underline"
                        >
                          <BrainCircuit className="w-4 h-4" />
                          AI Insights
                          {expandedVideo === video.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </motion.button>

                        <AnimatePresence>
                          {expandedVideo === video.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 pt-4 border-t border-dark-700/50"
                            >
                              <div className="grid grid-cols-2 gap-8">
                                <div>
                                  <h5 className="text-sm font-medium text-white mb-4">Performance Analysis</h5>
                                  <div className="space-y-6">
                                    {renderMetricsGauge(video.insights.engagement, 'Engagement Score')}
                                    {renderMetricsGauge(video.insights.quality, 'Content Quality')}
                                    {renderMetricsGauge(video.insights.seo, 'SEO Score')}
                                  </div>

                                  <div className="mt-6">
                                    <h6 className="text-sm font-medium text-white mb-2">Key Factors</h6>
                                    <div className="space-y-2">
                                      {video.insights.performanceFactors.map((factor, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                          {factor.impact === 'high' ? (
                                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                                          ) : factor.impact === 'medium' ? (
                                            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-red-400 mt-0.5" />
                                          )}
                                          <div>
                                            <p className="text-sm font-medium text-white">{factor.factor}</p>
                                            <p className="text-xs text-gray-400">{factor.description}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h5 className="text-sm font-medium text-white mb-4">SEO Recommendations</h5>
                                  {renderSEORecommendations(video.insights.seoAnalysis)}
                                </div>
                              </div>

                              <div className="mt-6 pt-6 border-t border-dark-700/50">
                                <div className="grid grid-cols-2 gap-8">
                                  <div>
                                    <h6 className="text-sm font-medium text-white mb-2">Strengths</h6>
                                    <ul className="space-y-1">
                                      {video.insights.strengths.map((strength, index) => (
                                        <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-400" />
                                          {strength}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <h6 className="text-sm font-medium text-white mb-2">Opportunities</h6>
                                    <ul className="space-y-1">
                                      {video.insights.opportunities.map((opportunity, index) => (
                                        <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                                          {opportunity}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}