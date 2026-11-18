import Link from "next/link";

export const metadata = { title: "How it works · My Stylist" };

const STEPS = [
  { t: "Calibrate", d: "Phone cameras tint photos warmer or cooler and often underexpose deeper skin. The white paper in your selfie is a known reference, so the app corrects the color and brightness, like a pro calibrating their lights." },
  { t: "Measure", d: "Skin is sampled from your forehead, cheeks, jaw and neck, then measured in CIELAB, the color space scientists use. You get your skin depth on the Monk Skin Tone Scale (10 shades, designed to represent every skin tone fairly) and your ITA°, a dermatology measure." },
  { t: "Read undertone, including olive", d: "Instead of one warm-to-cool slider, the app measures hue angle, redness and chroma separately. Olive skin (low red, muted, green-gold) gets its own reading, because it's the complexion apps most often misjudge." },
  { t: "Separate tan from undertone", d: "Your inner wrist rarely sees sun. Comparing it with your face shows how much of your color is tan or redness sitting on top, and how much is your true undertone." },
  { t: "Drape", d: "16 test colors are placed under your calibrated face, in pairs that test one thing at a time: warm vs cool, light vs deep, bright vs soft. The AI judges which colors even your skin and brighten your eyes, like an analyst watching your face." },
  { t: "Decide, honestly", d: "Measurements, drapes and photos are combined into your season, body type and essence. When the evidence is split, you'll see a confidence level and the runner-up instead of a confident guess." },
];

export default function HowItWorks() {
  return (
    <div>
      <div style={{ padding: "18px 0 6px" }}>
        <div className="kicker"><Link href="/learn" style={{ color: "inherit" }}>Learn</Link> · The science</div>
        <h1>How My Stylist analyzes you</h1>
        <p className="lede">Most color apps read the raw colors in a photo. My Stylist works like a trained analyst, in six steps.</p>
      </div>
      <ol className="numbered">
        {STEPS.map((s) => (
          <li key={s.t} className="card"><h3>{s.t}</h3><p style={{ margin: 0 }}>{s.d}</p></li>
        ))}
      </ol>
      <div className="notice">Body type uses your height and full-length photos. Essence reads your face and overall impression. Neither is about weight or size.</div>
    </div>
  );
}
