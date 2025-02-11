// src/hooks/useResizeObserver.ts
import { useEffect } from "react";

const useResizeObserver = (
  ref: React.RefObject<HTMLElement>,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions
) => {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(callback);
    observer.observe(ref.current, options);
    return () => {
      observer.disconnect();
    };
  }, [ref, callback, options]);
};

export default useResizeObserver;
