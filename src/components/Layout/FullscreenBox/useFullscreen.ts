import { useCallback, useState } from 'react';

export function useFullscreen(defaultFullscreen = false) {
  const [fullscreen, setFullscreen] = useState(defaultFullscreen);
  const toggle = useCallback(() => setFullscreen((v) => !v), []);
  const exit = useCallback(() => setFullscreen(false), []);
  return { fullscreen, setFullscreen, toggle, exit };
}
