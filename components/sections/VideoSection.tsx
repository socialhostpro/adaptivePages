
import React from 'react';
import type { VideoSectionData, LandingPageTheme } from '../../types';
import EmbedHandler from '../shared/EmbedHandler';

interface VideoSectionProps {
  section: VideoSectionData;
  theme: LandingPageTheme;
}

const VideoSection: React.FC<VideoSectionProps> = ({ section, theme }) => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className={`text-4xl font-extrabold text-${theme.textColorName}-900 dark:text-${theme.textColorName}-100`}>
          {section.title}
        </h2>
        <p className={`mt-4 max-w-2xl mx-auto text-lg text-${theme.textColorName}-600 dark:text-${theme.textColorName}-300`}>
          {section.subtitle}
        </p>
        <div className="mt-12 aspect-video w-full rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700 [&_iframe]:w-full [&_iframe]:h-full">
           {section.videoEmbedCode ? (
                <EmbedHandler embedCode={section.videoEmbedCode} />
            ) : section.videoSource === 'vimeo' && section.vimeoVideoId ? (
                <iframe
                    className="w-full h-full"
                    src={`https://player.vimeo.com/video/${section.vimeoVideoId}?title=0&byline=0&portrait=0`}
                    title="Vimeo video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${section.youtubeVideoId}?rel=0&showinfo=0&modestbranding=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            )}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;