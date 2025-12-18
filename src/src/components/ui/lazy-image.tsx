import { useState, useEffect, useRef } from "react";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderSrc?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  placeholderSrc,
  className,
  ...props 
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "50px", // Start loading slightly before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // If no src, don't render anything
  if (!src) return null;

  return (
    <div className="relative overflow-hidden" ref={imgRef}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className || ""} ${isLoaded ? "opacity-100" : "opacity-0"} transition-opacity duration-300`}
          onLoad={handleLoad}
          {...props}
        />
      )}
      {!isLoaded && isInView && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse ${className || ""}`} />
      )}
      {placeholderSrc && !isInView && (
        <img
          src={placeholderSrc}
          alt={alt}
          className={`${className || ""} opacity-100 blur-sm scale-105`}
          {...props}
        />
      )}
      {!placeholderSrc && !isInView && (
        <div className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 ${className || ""}`} />
      )}
    </div>
  );
}