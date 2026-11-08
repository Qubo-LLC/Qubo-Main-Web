/**
 * App Router templates re-mount on every navigation, so each new page
 * plays the enter animation defined by `.page-enter` in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
