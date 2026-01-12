import React from 'react'

interface Props {
  visionScore?: number
  images?: { name: string; b64: string }[]
}

export const VisionDetection: React.FC<Props> = ({ visionScore = 0, images = [] }) => {
  return (
    <div className="bg-slate-900 p-4 rounded">
      <div className="text-sm text-slate-300 font-medium">Vision Detection</div>
      <div className="mt-2">Logo spoof score: {visionScore.toFixed(2)}</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {images.map((img) => (
          <div key={img.name} className="bg-slate-800 p-2 rounded">
            <img src={img.b64} alt={img.name} className="w-full h-24 object-contain" />
            <div className="text-xs mt-1 text-slate-300 truncate">{img.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisionDetection
