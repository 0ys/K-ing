export const catchLastScrollItem = (isLoading, lastElementRef, getNextData, hasMore) => {
  if (isLoading || !lastElementRef.current) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        getNextData();
      }
    },
    { threshold: 0.5 },
  );

  if (lastElementRef.current) {
    observer.observe(lastElementRef.current);
  }

  return () => {
    if (lastElementRef.current) {
      observer.unobserve(lastElementRef.current);
    }
  };
};
