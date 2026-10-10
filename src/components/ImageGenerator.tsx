import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Maximize2,
  X,
  Shuffle,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  FolderOpen,
} from 'lucide-react';
import { GeneratedImage } from '../types';
import { loadStoredImages, saveStoredImages, clearStoredImages } from '../lib/storage';

const SAMPLE_PROMPTS = [
  'A mystical bioluminescent forest at night with glowing fauna and ancient mossy trees, 8k resolution',
  'Futuristic cybernetic samurai standing on a rain-slicked Tokyo rooftop, neon signs reflecting, cinematic lighting',
  'An ethereal glass greenhouse floating among the clouds during a golden sunset, dreamlike architectural concept',
  'A hyper-detailed mechanical hummingbird crafted from polished brass and glowing quartz crystal gears',
  'Cozy retro café in autumn Paris with warm ambient interior lights and golden falling leaves outside the window',
  'Surreal cosmic library where swirling spiral galaxies swirl inside floating crystal orbs among towering shelves',
  'Majestic snow leopard resting on Himalayan mountain summit under a vivid starry night sky with aurora',
  'Minimalist modern architectural villa embedded in a desert cliff face with an infinity pool overlooking canyons',
];

const STYLES = [
  { id: 'none', label: 'Default', badge: 'Natural' },
  { id: 'photorealistic', label: 'Photorealistic', badge: 'Ultra 8K' },
  { id: 'cinematic', label: 'Cinematic', badge: 'Film Still' },
  { id: 'anime', label: 'Anime / Manga', badge: 'Vibrant' },
  { id: '3d', label: '3D Render', badge: 'Octane / UE5' },
  { id: 'cyberpunk', label: 'Cyberpunk', badge: 'Neon Dark' },
  { id: 'fantasy', label: 'Fantasy Art', badge: 'Mythic' },
  { id: 'watercolor', label: 'Watercolor', badge: 'Artistic' },
  { id: 'minimalist', label: 'Minimalist', badge: 'Vector' },
];

const ASPECT_RATIOS: Array<{ id: '1:1' | '16:9' | '9:16' | '4:3'; label: string; desc: string; iconClass: string }> = [
  { id: '1:1', label: '1:1', desc: 'Square', iconClass: 'w-4 h-4 rounded-sm border-2 border-current' },
  { id: '16:9', label: '16:9', desc: 'Landscape', iconClass: 'w-5 h-3 rounded-xs border-2 border-current' },
  { id: '9:16', label: '9:16', desc: 'Portrait', iconClass: 'w-3 h-5 rounded-xs border-2 border-current' },
  { id: '4:3', label: '4:3', desc: 'Standard', iconClass: 'w-4.5 h-3.5 rounded-xs border-2 border-current' },
];

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>(() => loadStoredImages());
  const [previewModalImage, setPreviewModalImage] = useState<GeneratedImage | null>(null);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    saveStoredImages(imageHistory);
  }, [imageHistory]);

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length);
    setPrompt(SAMPLE_PROMPTS[randomIndex]);
  };

  const handleGenerate = async (overridePrompt?: string, overrideSeed?: number) => {
    const targetPrompt = (overridePrompt || prompt).trim();
    if (!targetPrompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setImageLoadError(false);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetPrompt,
          aspectRatio,
          style: selectedStyle,
          seed: overrideSeed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate image generation.');
      }

      const data = await response.json();
      if (!data.success || !data.url) {
        throw new Error(data.error || 'Could not generate image.');
      }

      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        prompt: targetPrompt,
        enhancedPrompt: data.enhancedPrompt,
        url: data.url,
        aspectRatio,
        style: selectedStyle,
        seed: data.seed,
        createdAt: Date.now(),
      };

      setCurrentImage(newImage);
      setImageHistory((prev) => [newImage, ...prev.filter((img) => img.id !== newImage.id)]);
    } catch (err) {
      console.error('Image generation error:', err);
      setError(err instanceof Error ? err.message : 'Error generating image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPromptId(id);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (e) {
      console.error('Failed to copy prompt:', e);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      setDownloadingId(image.id);
      const safeSlug = (image.prompt || 'artwork')
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase();
      const filename = `mpk-ai-${safeSlug}-${image.seed || Date.now()}.jpg`;

      // Server proxy attachment endpoint triggers direct native save on mobile & desktop
      const downloadUrl = `/api/download-image?url=${encodeURIComponent(image.url)}&filename=${encodeURIComponent(filename)}`;

      try {
        const response = await fetch(downloadUrl);
        if (response.ok) {
          const blob = await response.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);

          setDownloadSuccessId(image.id);
          setTimeout(() => setDownloadSuccessId(null), 2500);
          return;
        }
      } catch (blobErr) {
        console.warn('Direct blob fetch download fallback:', blobErr);
      }

      // Fallback: direct anchor download trigger
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccessId(image.id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    } catch (err) {
      console.error('Download error:', err);
      window.open(image.url, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReopenImage = (image: GeneratedImage) => {
    setCurrentImage(image);
    setPrompt(image.prompt);
    setSelectedStyle(image.style || 'none');
    setAspectRatio(image.aspectRatio || '1:1');
    setImageLoadError(false);
    if (previewModalImage) {
      setPreviewModalImage(null);
    }
    // Smooth scroll to top of workspace
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteImage = (id: string) => {
    setImageHistory((prev) => prev.filter((img) => img.id !== id));
    if (currentImage?.id === id) {
      setCurrentImage(null);
    }
    if (previewModalImage?.id === id) {
      setPreviewModalImage(null);
    }
  };

  const handleClearAllHistory = () => {
    if (confirm('Clear all generated image history?')) {
      clearStoredImages();
      setImageHistory([]);
      setCurrentImage(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-neutral-950 px-3 sm:px-6 py-4 sm:py-6 max-w-5xl mx-auto w-full">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-850 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              MPK AI Image Generator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Create high-definition artwork, concepts, and photorealistic imagery. Powered by a free AI synthesis engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Free • No API Key Needed</span>
          </span>
        </div>
      </div>

      {/* Main Creation Card */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 sm:p-5 shadow-xl backdrop-blur-md mb-8">
        {/* Prompt Input Area */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
            <span>Prompt Description</span>
            <button
              onClick={handleRandomPrompt}
              type="button"
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-normal transition-colors cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              <span>Surprise Me</span>
            </button>
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create in vivid detail (e.g., A futuristic cyberpunk street in neon rain with flying vehicles, 8k resolution photorealistic)..."
              rows={3}
              className="w-full rounded-xl bg-neutral-950/80 border border-neutral-800 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 text-neutral-100 placeholder-neutral-500 text-sm p-3.5 outline-none resize-none selection:bg-neutral-800 transition-all"
            />
            {prompt && (
              <button
                onClick={() => setPrompt('')}
                type="button"
                className="absolute right-3 top-3 p-1 text-neutral-500 hover:text-neutral-300 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Style Presets */}
        <div className="mt-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Style Preset</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {STYLES.map((style) => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  type="button"
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-xs'
                      : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-xs font-medium text-neutral-200">{style.label}</div>
                  <div className="text-[10px] text-neutral-400">{style.badge}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio & Generate Button Row */}
        <div className="mt-5 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
              Aspect Ratio
            </span>
            <div className="flex items-center gap-2">
              {ASPECT_RATIOS.map((ratio) => {
                const isSelected = aspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white'
                        : 'border-neutral-800 bg-neutral-950/50 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <div className={ratio.iconClass} />
                    <span>{ratio.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleGenerate()}
            disabled={isGenerating || !prompt.trim()}
            type="button"
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              isGenerating || !prompt.trim()
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-lg shadow-indigo-600/25 active:scale-98'
            }`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating Image...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Artwork</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Current Result Showcase */}
      {isGenerating && (
        <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xl animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-base font-semibold text-white">Synthesizing AI Artwork...</h3>
          <p className="text-xs text-neutral-400 max-w-sm mt-1">
            Applying neural diffusion to prompt: <span className="text-neutral-300 font-mono italic">"{prompt.slice(0, 60)}..."</span>
          </p>
        </div>
      )}

      {currentImage && !isGenerating && (
        <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden shadow-2xl">
          <div className="p-3.5 sm:p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-neutral-200">Active Artwork</span>
              <span className="text-[10px] text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded-full uppercase">
                {currentImage.aspectRatio} • {currentImage.style}
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleCopyPrompt(currentImage.prompt, currentImage.id)}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-300 transition-colors cursor-pointer"
              >
                {copiedPromptId === currentImage.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleGenerate(currentImage.prompt, Math.floor(Math.random() * 10000000))}
                type="button"
                title="Regenerate with new seed"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-300 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-roll</span>
              </button>

              {/* Dedicated Download Image Button */}
              <button
                onClick={() => handleDownload(currentImage)}
                disabled={downloadingId === currentImage.id}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                title="Download image to your computer or mobile device"
              >
                {downloadingId === currentImage.id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Saving...</span>
                  </>
                ) : downloadSuccessId === currentImage.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved to Device!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="font-semibold">Download Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="relative group bg-neutral-950 flex items-center justify-center p-2 min-h-[360px] sm:min-h-[460px]">
            {!imageLoadError ? (
              <img
                src={currentImage.url}
                alt={currentImage.prompt}
                referrerPolicy="no-referrer"
                onError={() => setImageLoadError(true)}
                className="max-h-[600px] w-auto object-contain rounded-xl shadow-lg transition-transform"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 p-8">
                <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
                <p className="text-xs">Failed to display preview image directly.</p>
                <a
                  href={currentImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-indigo-400 underline text-xs flex items-center gap-1"
                >
                  Open image link directly <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* Quick Action Overlay Buttons */}
            <div className="absolute right-4 bottom-4 flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDownload(currentImage)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-medium hover:bg-black/90 cursor-pointer shadow-lg border border-white/10"
                title="Download Image"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save</span>
              </button>

              <button
                onClick={() => setPreviewModalImage(currentImage)}
                type="button"
                className="p-2 rounded-xl bg-black/75 backdrop-blur-md text-white hover:bg-black/90 cursor-pointer shadow-lg border border-white/10"
                title="View full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-neutral-950/60 border-t border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                <span className="text-neutral-400 font-semibold mr-1">Prompt:</span>
                {currentImage.prompt}
              </p>
              {currentImage.enhancedPrompt && currentImage.enhancedPrompt !== currentImage.prompt && (
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed italic">
                  <span className="text-neutral-400 font-medium mr-1">Enhanced:</span>
                  {currentImage.enhancedPrompt}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleDownload(currentImage)}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-medium cursor-pointer shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Your Generated Gallery</h2>
            <span className="text-xs text-neutral-400">({imageHistory.length})</span>
          </div>

          {imageHistory.length > 0 && (
            <button
              onClick={handleClearAllHistory}
              type="button"
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Gallery</span>
            </button>
          )}
        </div>

        {imageHistory.length === 0 ? (
          <div className="p-10 rounded-2xl border border-dashed border-neutral-800 text-center text-neutral-400">
            <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-neutral-400" />
            <p className="text-sm">No images generated yet.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Type a prompt above or click "Surprise Me" to create your first artwork.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
            {imageHistory.map((img) => (
              <div
                key={img.id}
                className="group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between transition-all hover:border-neutral-700 hover:shadow-xl"
              >
                {/* Image Container with Tap to Reopen */}
                <div
                  onClick={() => handleReopenImage(img)}
                  className="relative aspect-square w-full overflow-hidden bg-neutral-950 cursor-pointer"
                  title="Click to reopen image in studio"
                >
                  <img
                    src={img.url}
                    alt={img.prompt}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top quick badges */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {img.aspectRatio}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id);
                      }}
                      type="button"
                      className="p-1.5 rounded-lg bg-black/70 backdrop-blur-md text-neutral-300 hover:text-rose-400 hover:bg-black/90 pointer-events-auto transition-colors cursor-pointer"
                      title="Delete from gallery"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Hover Overlay with Quick Reopen Hint */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                    <span className="flex items-center gap-1 text-xs text-white font-medium bg-black/75 px-3 py-1.5 rounded-xl border border-white/20 shadow-lg">
                      <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Click to Reopen</span>
                    </span>
                  </div>
                </div>

                {/* Card Content & Action Bar */}
                <div className="p-3 bg-neutral-950/80 border-t border-neutral-850 flex flex-col gap-2.5">
                  <p
                    onClick={() => handleReopenImage(img)}
                    className="text-xs text-neutral-200 line-clamp-2 font-medium cursor-pointer hover:text-indigo-300 transition-colors"
                    title={img.prompt}
                  >
                    {img.prompt}
                  </p>

                  <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-neutral-850/60">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReopenImage(img)}
                        type="button"
                        className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-medium transition-colors cursor-pointer"
                        title="Reopen in generator"
                      >
                        <FolderOpen className="w-3 h-3 text-indigo-400" />
                        <span>Reopen</span>
                      </button>

                      <button
                        onClick={() => setPreviewModalImage(img)}
                        type="button"
                        className="p-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                        title="Zoom full screen"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Prominent Download Button on Every Gallery Image */}
                    <button
                      onClick={() => handleDownload(img)}
                      disabled={downloadingId === img.id}
                      type="button"
                      className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors cursor-pointer shadow-xs active:scale-98"
                      title="Download image to device"
                    >
                      {downloadingId === img.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-white" />
                          <span>Saving...</span>
                        </>
                      ) : downloadSuccessId === img.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-300" />
                          <span>Saved!</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal with Full Reopen & Download Controls */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="p-3.5 sm:p-4 border-b border-neutral-800 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                {previewModalImage.prompt}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleReopenImage(previewModalImage)}
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-neutral-800 hover:bg-neutral-750 text-neutral-200 font-medium transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Reopen in Studio</span>
                </button>

                <button
                  onClick={() => handleDownload(previewModalImage)}
                  disabled={downloadingId === previewModalImage.id}
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium shadow-md transition-all cursor-pointer"
                >
                  {downloadingId === previewModalImage.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : downloadSuccessId === previewModalImage.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Image</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setPreviewModalImage(null)}
                  type="button"
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/60 min-h-[300px]">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.prompt}
                referrerPolicy="no-referrer"
                className="max-h-[68vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>

            <div className="p-3.5 bg-neutral-950/80 border-t border-neutral-850 flex items-center justify-between text-xs text-neutral-400">
              <span className="truncate max-w-md">{previewModalImage.prompt}</span>
              <span className="text-[11px] font-mono text-neutral-400">Seed: {previewModalImage.seed}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
