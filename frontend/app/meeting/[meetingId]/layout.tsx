/**
 * Chrome-free shell for the meeting experience.
 *
 * Sits at the top level of `app/`, outside the `(dashboard)` group, so there
 * is no utility bar, navbar, or sidebar to hide — none of it exists here.
 */
export default function MeetingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-zoom-room-bg text-white">
      {children}
    </div>
  );
}
