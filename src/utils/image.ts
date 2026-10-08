const imagePreloadCache = new Map<string, Promise<void>>();

export const preloadImage = (url: string): Promise<void> => {
  const cached = imagePreloadCache.get(url);
  if (cached) return cached;

  const preload = new Promise<void>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (typeof image.decode !== 'function') {
        resolve();
        return;
      }

      // Loading has already completed, so a decode rejection should not make
      // an otherwise usable animated image unavailable.
      image.decode().then(resolve).catch(resolve);
    };
    image.onerror = () => reject(new Error(`Unable to preload image: ${url}`));
    image.src = url;
  }).catch((error: unknown) => {
    imagePreloadCache.delete(url);
    throw error;
  });

  imagePreloadCache.set(url, preload);
  return preload;
};

export const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(preloadImage));
};
