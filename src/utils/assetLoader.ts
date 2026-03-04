export const loadImages = (paths: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(
    paths.map((path) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.warn('Failed to load image: ' + path);
          resolve(img); // Still resolve with the image object
        };
        // In some environments (like testing), onload might not trigger for invalid paths
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
          setTimeout(() => resolve(img), 10);
        }
      });
    })
  );
};

export const loadVideos = (paths: string[]): Promise<HTMLVideoElement[]> => {
  return Promise.all(
    paths.map((path) => {
      return new Promise<HTMLVideoElement>((resolve) => {
        const video = document.createElement('video');
        video.src = path;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.oncanplaythrough = () => resolve(video);
        video.onerror = () => {
          console.warn('Failed to load video: ' + path);
          resolve(video);
        };
        // Fallback for environments where video events don't fire
        setTimeout(() => resolve(video), 100);
      });
    })
  );
};

export const preloadAssets = async (imagePaths: string[], videoPaths: string[]) => {
  const [images, videos] = await Promise.all([
    loadImages(imagePaths),
    loadVideos(videoPaths),
  ]);
  return { images, videos };
};
