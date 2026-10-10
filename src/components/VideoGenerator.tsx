import React, { useState, useEffect } from 'react';
import {
  Video,
  Lock,
  AlertTriangle,
  Info,
  Clock,
  Film,
  Camera,
  Layers,
  Sparkles,
  ShieldAlert,
  Play,
  CheckCircle2,
} from 'lucide-react';

interface VideoStatus {
  available: boolean;
  configured: boolean;
  statusText: string;
  message: string;
}

const SAMPLE_VIDEO_PROMPTS = [
  'Cinematic drone flyover across emerald mountain peaks shrouded in morning mist at golden hour',
  'Macro shot of a dewdrop falling from a vibrant crimson petal, extreme slow motion 120fps',
  'Futuristic high-speed train zooming across a glowing illuminated cyberpunk metropolis bridge',
  'Underwater coral reef with bioluminescent jellyfish drifting through sunlit tropical waters',
];

const CAMERA_MOTIONS = [
  { id: 'pan-left', label: 'Pan Left' },
  { id: 'pan-right', label: 'Pan Right' },
  { id: 'zoom-in', label: 'Zoom In' },
  { id: 'zoom-out', label: 'Zoom Out' },
  { id: 'orbital', label: 'Orbital Arc' },
  { id: 'static', label: 'Static Lock' },
];

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<'4s' | '6s' | '10s'>('4s');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [cameraMotion, setCameraMotion] = useState('zoom-in');
  const [motionIntensity, setMotionIntensity] = useState(5);
  const [fps, setFps] = useState<'24' | '30'>('24');
  const [status, setStatus] = useState<VideoStatus>({
    available: false,
    configured: false,
    statusText: 'Generation Unavailable',
    message: 'No free video generation API configured. Video generation models require metered GPU compute.',
  });

  useEffect(() => {
    fetch('/api/video-status')
      .then((res) => res.json())
      .then((data: VideoStatus) => setStatus(data))
      .catch(() => {
        // Fallback default
      });
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-neutral-950 px-3 sm:px-6 py-4 sm:py-6 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-orange-600 to-rose-500 flex items-center justify-center text-white shadow-md">
              <Video className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              MPK AI Video Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Studio-grade AI video synthesis studio interface.
          </p>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-800/40 text-amber-400 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Generation Unavailable (No Free API)</span>
          </span>
        </div>
      </div>

      {/* Prominent Status Notice Banner */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-neutral-300">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-900/30 text-amber-400 flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-200">
              Video Synthesis API Status: Not Configured
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Unlike text and image generation, high-fidelity AI video synthesis models (such as Veo, Sora, Kling, or Runway Gen-3) require specialized multi-GPU compute clusters that currently do not provide an unmetered free tier.
            </p>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              To strictly respect user privacy and adhere to our policy of zero unauthorized billing and no paid API requirements, <strong>video generation is intentionally disabled and locked</strong> until a verified free or self-hosted endpoint is integrated.
            </p>
          </div>
        </div>
      </div>

      {/* Studio Configuration Workspace */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-md mb-8">
        {/* Prompt Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Scene & Motion Prompt
            </label>
            <span className="text-[11px] text-neutral-400">Preview Mode</span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the motion, camera trajectory, atmosphere and lighting of your scene (e.g., Drone cinematic zoom into a medieval stone castle perched on an ocean cliff)..."
            rows={3}
            className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 text-neutral-100 placeholder-neutral-500 text-sm p-3.5 outline-none resize-none transition-all"
          />

          {/* Quick inspiration tags */}
          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] text-neutral-400 flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Sample scenes:</span>
            </span>
            {SAMPLE_VIDEO_PROMPTS.slice(0, 2).map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(sample)}
                type="button"
                className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 transition-colors truncate max-w-[280px] cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Video Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-neutral-800">
          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Duration</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['4s', '6s', '10s'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  type="button"
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    duration === d
                      ? 'border-amber-500 bg-amber-950/30 text-white'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Aspect Ratio</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['16:9', '9:16', '1:1'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  type="button"
                  className={`py-2 px-2 rounded-lg border text-xs font-medium transition-all ${
                    aspectRatio === ratio
                      ? 'border-amber-500 bg-amber-950/30 text-white'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-white'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Motion */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Camera Movement</span>
            </label>
            <select
              value={cameraMotion}
              onChange={(e) => setCameraMotion(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-neutral-800 bg-neutral-950/60 text-xs text-neutral-200 outline-none focus:border-amber-500/60"
            >
              {CAMERA_MOTIONS.map((motion) => (
                <option key={motion.id} value={motion.id}>
                  {motion.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Motion Dynamics & Frame Rate */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-800">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Motion Intensity ({motionIntensity}/10)
              </label>
              <span className="text-[11px] text-neutral-400">Cinematic Fluidity</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={motionIntensity}
              onChange={(e) => setMotionIntensity(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Frame Rate Output
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['24', '30'] as const).map((val) => (
                <button
                  key={val}
                  onClick={() => setFps(val)}
                  type="button"
                  className={`py-1.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                    fps === val
                      ? 'border-amber-500 bg-amber-950/30 text-white'
                      : 'border-neutral-800 bg-neutral-950/40 text-neutral-400'
                  }`}
                >
                  {val} FPS (Film standard)
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button - Explicitly Disabled & Marked Unavailable */}
        <div className="mt-6 pt-5 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Generation is disabled to prevent accidental paid subscription requests.</span>
          </div>

          <button
            type="button"
            disabled={true}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm bg-neutral-800/80 text-neutral-500 border border-neutral-700/50 cursor-not-allowed shadow-inner"
          >
            <Lock className="w-4 h-4 text-neutral-500" />
            <span>Generation Unavailable (No Free API)</span>
          </button>
        </div>
      </div>

      {/* Conceptual Storyboard Showcase */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-amber-400" />
          <h2 className="text-base font-semibold text-white">Video Studio Capabilities Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>High Temporal Coherence</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Designed to support continuous 24fps keyframe interpolation, camera tracking motions, and volumetric illumination.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
            <div className="flex items-center gap-2 text-neutral-200 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Unwanted Billing Safeguard</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              MPK AI guarantees no unexpected cloud usage fees or hidden subscriptions. Video generation stays offline until a verified free tier API is available.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
