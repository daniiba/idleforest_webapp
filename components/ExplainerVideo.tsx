import React from 'react'

const ExplainerVideo: React.FC = () => (
  <div className="w-full max-w-4xl mx-auto my-16 px-4">
    <div className="relative pb-[56.25%] h-0">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
        src="https://www.youtube.com/embed/xfbHOAvC4Kc"
        title="IdleForest Explainer Video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
)

export default ExplainerVideo
