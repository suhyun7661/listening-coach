import { categoryNames } from '../data/sampleData';

// Small colored tag like "SP · speed". Colors come from the error-tag tokens.
export function Tag({ id, plain }) {
  return (
    <span className={`tag tag--${id}`}>
      {plain ? id : `${id} · ${categoryNames[id]}`}
    </span>
  );
}

export function PlayIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  );
}

export function Icon({ name }) {
  const paths = {
    replay: <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />,
    loop: <path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3" />,
    speaker: <path d="M4 9v6h4l5 4V5L8 9H4zM17 8a5 5 0 0 1 0 8" />,
    search: <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />,
    pencil: <path d="M4 20l1-4L17 4l3 3L8 19l-4 1zM14 7l3 3" />,
    trophy: <path d="M8 4h8v6a4 4 0 0 1-8 0V4zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 21h8" />,
    timer: <path d="M12 8v5l3 2M9 2h6M12 5a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" />,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
