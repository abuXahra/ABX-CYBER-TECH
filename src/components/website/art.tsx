/**
 * Original decorative illustrations, used ONLY when no media-library image is chosen.
 * Colours come from theme tokens (Tailwind fill-* classes) so they follow the admin's theme.
 * They contain no company claims; replace them from the media library at any time.
 */
export function DeviceArt({ className }: { className?: string }) {
  const features = ["Fast Performance", "Mobile Responsive", "SEO Optimized", "Secure & Reliable"];
  return (
    <svg viewBox="0 0 760 520" role="img" aria-label="Illustration of a laptop and a smartphone showing a modern website and a mobile app" className={className}>
      {/* decorative leaves */}
      <path d="M690 40c30 30 40 70 20 110-30-30-38-70-20-110z" className="fill-primary/30" /><path d="M722 90c24 18 34 46 24 78-24-18-32-46-24-78z" className="fill-primary/20" />
      {/* laptop */}
      <ellipse cx="330" cy="478" rx="300" ry="18" className="fill-dark/15" />
      <rect x="40" y="30" width="560" height="360" rx="22" className="fill-dark" />
      <rect x="56" y="46" width="528" height="328" rx="12" className="fill-background" />
      <rect x="56" y="46" width="528" height="34" rx="12" className="fill-surface" />
      <text x="76" y="68" className="fill-primary" style={{ font: "800 15px sans-serif" }}>ABX</text>
      <g className="fill-foreground/60" style={{ font: "500 7px sans-serif" }}><text x="300" y="66">Home</text><text x="340" y="66">About</text><text x="378" y="66">Services</text><text x="426" y="66">Contact</text></g>
      <rect x="500" y="55" width="62" height="16" rx="8" className="fill-primary" /><text x="531" y="66" textAnchor="middle" className="fill-white" style={{ font: "700 7px sans-serif" }}>Get Started</text>
      <g className="fill-heading" style={{ font: "800 26px sans-serif" }}><text x="84" y="132">Modern Websites</text><text x="84" y="162">for Growing</text><text x="84" y="192">Businesses</text></g>
      <g className="fill-foreground/70" style={{ font: "400 8px sans-serif" }}><text x="84" y="214">We design and develop high-performing websites</text><text x="84" y="226">that convert visitors into clients.</text></g>
      <rect x="84" y="242" width="84" height="26" rx="13" className="fill-primary" /><text x="126" y="259" textAnchor="middle" className="fill-white" style={{ font: "700 9px sans-serif" }}>Get Started</text>
      <rect x="320" y="104" width="236" height="170" rx="10" className="fill-primary/25" />
      <g className="fill-primary/70"><rect x="348" y="150" width="34" height="124" /><rect x="392" y="124" width="40" height="150" /><rect x="442" y="164" width="30" height="110" /><rect x="482" y="140" width="46" height="134" /></g>
      <g className="fill-background/80"><rect x="402" y="140" width="8" height="8" /><rect x="416" y="140" width="8" height="8" /><rect x="402" y="158" width="8" height="8" /><rect x="416" y="158" width="8" height="8" /><rect x="494" y="156" width="8" height="8" /><rect x="508" y="156" width="8" height="8" /></g>
      {features.map((f, i) => (
        <g key={f} transform={`translate(${84 + i * 118} 304)`}>
          <circle cx="12" cy="12" r="12" className="fill-surface" /><circle cx="12" cy="12" r="5" className="fill-primary" />
          <text x="32" y="16" className="fill-heading" style={{ font: "600 8px sans-serif" }}>{f}</text>
        </g>
      ))}
      <path d="M8 392h624l-26 40a26 26 0 0 1-22 12H56a26 26 0 0 1-22-12z" className="fill-line" />
      <rect x="250" y="392" width="140" height="12" rx="6" className="fill-foreground/25" />
      {/* phone */}
      <g transform="translate(520 120)">
        <rect width="210" height="392" rx="36" className="fill-dark" />
        <rect x="9" y="9" width="192" height="374" rx="28" className="fill-background" />
        <rect x="72" y="18" width="66" height="14" rx="7" className="fill-dark" />
        <text x="26" y="64" className="fill-primary" style={{ font: "800 13px sans-serif" }}>ABX</text><rect x="168" y="54" width="14" height="2" className="fill-foreground/60" /><rect x="168" y="59" width="14" height="2" className="fill-foreground/60" /><rect x="168" y="64" width="14" height="2" className="fill-foreground/60" />
        <g className="fill-heading" style={{ font: "800 17px sans-serif" }}><text x="26" y="104">Powerful</text><text x="26" y="124">Mobile Apps</text><text x="26" y="144">for Your Business</text></g>
        <g className="fill-foreground/70" style={{ font: "400 7px sans-serif" }}><text x="26" y="164">Turn your ideas into high-quality</text><text x="26" y="174">mobile applications.</text></g>
        <rect x="26" y="190" width="78" height="26" rx="13" className="fill-primary" /><text x="65" y="207" textAnchor="middle" className="fill-white" style={{ font: "700 9px sans-serif" }}>Let&apos;s Build</text>
        <rect x="26" y="240" width="158" height="116" rx="14" className="fill-surface" />
        <rect x="42" y="258" width="62" height="62" rx="12" className="fill-primary" /><rect x="114" y="258" width="54" height="26" rx="8" className="fill-accent" /><rect x="114" y="294" width="54" height="26" rx="8" className="fill-primary/40" />
        <rect x="42" y="332" width="110" height="8" rx="4" className="fill-foreground/25" />
      </g>
    </svg>
  );
}

export function WorkspaceArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of a developer desk with a laptop showing code, a plant and a mug" className={className}>
      <rect width="640" height="480" className="fill-surface" />
      <rect y="392" width="640" height="88" className="fill-foreground/15" />
      <g transform="translate(40 150)">
        <path d="M70 190c-60-40-70-120-30-170 30 50 40 100 30 170zM74 190c20-60 70-100 120-120-10 70-50 110-120 120zM70 190c-10-50 0-110 40-140 10 60-5 110-40 140z" className="fill-primary/80" />
        <path d="M30 190h90l-12 60H42z" className="fill-accent" />
      </g>
      <rect x="170" y="80" width="400" height="260" rx="14" className="fill-dark" />
      <rect x="184" y="94" width="372" height="232" rx="7" className="fill-dark" />
      <rect x="184" y="94" width="372" height="22" rx="7" className="fill-secondary" />
      <g className="fill-accent"><rect x="204" y="136" width="60" height="7" rx="3.5" /><rect x="204" y="190" width="38" height="7" rx="3.5" /></g>
      <g className="fill-white/80"><rect x="222" y="154" width="160" height="7" rx="3.5" /><rect x="222" y="172" width="116" height="7" rx="3.5" /><rect x="222" y="208" width="190" height="7" rx="3.5" /><rect x="222" y="226" width="140" height="7" rx="3.5" /></g>
      <g className="fill-primary"><rect x="400" y="154" width="96" height="7" rx="3.5" /><rect x="204" y="244" width="104" height="7" rx="3.5" /><rect x="204" y="262" width="150" height="7" rx="3.5" /></g>
      <path d="M130 340h480l-22 38a24 24 0 0 1-20 12H172a24 24 0 0 1-20-12z" className="fill-line" />
      <g transform="translate(70 318)">
        <rect width="74" height="72" rx="10" className="fill-dark" />
        <path d="M74 18h14a12 12 0 0 1 0 36H74" className="fill-none stroke-dark" strokeWidth="8" />
        <text x="37" y="44" textAnchor="middle" className="fill-white" style={{ font: "800 18px sans-serif" }}>ABX</text>
      </g>
    </svg>
  );
}

export function PromoArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 360" preserveAspectRatio="xMaxYMax slice" role="img" aria-label="Illustration of a developer working on a laptop displaying the ABX logo" className={className}>
      <circle cx="330" cy="90" r="64" className="fill-accent/30" />
      <circle cx="372" cy="170" r="44" className="fill-primary/25" />
      {/* person */}
      <path d="M96 360c0-70 40-110 104-110s104 40 104 110z" fill="#17413f" />
      <rect x="180" y="214" width="40" height="44" rx="14" fill="#6a4631" />
      <ellipse cx="200" cy="170" rx="46" ry="54" fill="#7a5239" />
      <path d="M154 158c0-40 28-58 52-56 28 2 42 24 40 56-10-22-22-30-44-30s-34 10-48 30z" fill="#1b1411" />
      <g fill="none" stroke="#10252a" strokeWidth="3"><rect x="168" y="168" width="28" height="20" rx="8" /><rect x="206" y="168" width="28" height="20" rx="8" /><path d="M196 177h10" /></g>
      {/* laptop lid facing the viewer */}
      <path d="M92 360l36-116a12 12 0 0 1 11-8h122a12 12 0 0 1 11 16l-30 108z" className="fill-secondary" />
      <text x="214" y="318" textAnchor="middle" className="fill-white/90" style={{ font: "800 30px sans-serif" }}>ABX</text>
    </svg>
  );
}
