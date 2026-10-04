/** Quiet, original vector illustration; no network asset or animation. */
export default function FlockDoodle({ className = "" }: { className?: string }) {
  return <svg className={"wt-flock-doodle " + className} viewBox="0 0 380 155" fill="none" aria-hidden="true" focusable="false">
    <path d="M10 132c65-22 104-18 164-7s115-22 192 7" stroke="#92a877" strokeWidth="2" strokeLinecap="round"/>
    {[{ x: 94, y: 88, s: 1.1 }, { x: 216, y: 91, s: .95 }, { x: 307, y: 108, s: .65 }].map(({ x, y, s }) => <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cy="37" rx="43" ry="6" fill="#b5c79a" opacity=".35"/>
      <path d="M-21 13v21m38-21v21" stroke="#244c48" strokeWidth="7" strokeLinecap="round"/>
      <path d="M-38-3c-8-14 3-23 13-20-1-14 17-20 24-11 8-9 23-3 22 8 15-3 22 9 17 20 10 11-1 24-12 20-9 14-24 6-27 1-13 9-28 3-29-9-9 1-17-4-15-13Z" fill="#fff8e5" stroke="#244c48" strokeWidth="2"/>
      <path d="M29-13c11-5 20 1 21 11v10c-1 10-10 16-18 9-8-7-8-25-3-30Z" fill="#244c48"/>
      <path d="m32-15-1-12m15 13 11-5" stroke="#244c48" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="40" cy="-2" r="2" fill="#fff8e5"/><path d="m45 10-3 1" stroke="#efb79a" strokeWidth="2" strokeLinecap="round"/>
    </g>)}
    <path d="m21 128-5-13m5 13 8-9m154 11-2-15m2 15 6-9m170 10 3-14m-3 14-7-9" stroke="#738f64" strokeWidth="2" strokeLinecap="round"/>
    <path d="m33 49 9-4m-4-7 2 13m127-20 8 3m-3-7-2 13" stroke="#d6b057" strokeWidth="2" strokeLinecap="round"/>
  </svg>;
}
