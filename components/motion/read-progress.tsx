// A 2px vermilion line under the header that grows with the page's scroll (`.read-progress`, styles/motion.css). CSS only: it stays hidden where scroll timelines are missing, under reduced motion and in print.
export function ReadProgress() {
  return (
    <div
      aria-hidden
      className="read-progress fixed inset-x-0 top-16 z-50 hidden h-0.5 origin-left bg-primary-container"
    />
  );
}
