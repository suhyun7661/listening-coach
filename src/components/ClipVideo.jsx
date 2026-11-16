import { useState } from 'react';

const MODE_LABEL = { off: 'Off', en: 'English', ko: 'Korean' };

// The full video with normal player controls but NO speed option and no fullscreen button
// (the subtitles sit on top of the picture). The learner can turn subtitles on or off.
// "subtitleModes" says which choices to offer: the Watch screen offers Off and Korean only
// (English would give the dictation answers away); the Review Report offers all three.
export default function ClipVideo({ clip, subtitleModes = ['off', 'ko'], onEnded }) {
  const [mode, setMode] = useState('off');
  const [time, setTime] = useState(0);

  const line = clip.sentences.find((s) => time >= s.start && time <= s.end);
  const text = mode === 'en' ? line?.text : mode === 'ko' ? line?.ko : '';

  return (
    <div className="clipvideo">
      <div className="clipvideo__frame">
        <video
          className="clipvideo__video"
          src={clip.videoId}
          controls
          controlsList="nodownload noplaybackrate nofullscreen"
          disablePictureInPicture
          playsInline
          preload="metadata"
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onEnded={onEnded}
        />
        {text && <p className="clipvideo__sub" lang={mode === 'ko' ? 'ko' : 'en'} aria-live="off">{text}</p>}
      </div>
      <div className="clipvideo__bar" role="group" aria-label="Subtitles">
        <span className="clipvideo__bar-label">Subtitles</span>
        {subtitleModes.map((m) => (
          <button key={m} type="button" className={`chip chip--small${mode === m ? ' is-selected' : ''}`} aria-pressed={mode === m} onClick={() => setMode(m)}>
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>
    </div>
  );
}
