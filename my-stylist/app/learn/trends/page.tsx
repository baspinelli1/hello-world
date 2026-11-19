import Link from "next/link";

export const metadata = { title: "Trends vs classics · Maven" };

export default function Trends() {
  return (
    <div>
      <div style={{ padding: "18px 0 6px" }}>
        <div className="kicker"><Link href="/learn" style={{ color: "inherit" }}>Learn</Link> · Shop smarter</div>
        <h1>Trends vs classics</h1>
        <p className="lede">Loving a trend is great. Knowing why you love it helps you spend on what you'll actually keep wearing.</p>
      </div>
      <section className="card"><h3>Why trends feel irresistible</h3><p style={{ margin: 0 }}>When a color or shape shows up everywhere (feeds, shop windows, influencers), it starts to feel right just because it's familiar. Fast fashion speeds this up, releasing new trends constantly so there's always something new to want.</p></section>
      <section className="card"><h3>Trend</h3><p style={{ margin: 0 }}>Peaks for a season or two. Fun, current, and often cheap to try. A micro-trend can come and go in weeks.</p></section>
      <section className="card"><h3>Classic</h3><p style={{ margin: 0 }}>Keeps coming back or never leaves: a camel coat, good jeans, a white shirt in your best white. Worth investing in, especially in your colors and lines.</p></section>
      <section className="card"><h3>The Maven approach</h3>
        <ul>
          <li>Wear the trend if it makes you happy. You'll know exactly why it does or doesn't flatter you.</li>
          <li>Try trends secondhand or in small doses (an accessory, not a coat).</li>
          <li>Look for the version of the trend in your palette: a slate blue instead of icy blue, for example.</li>
        </ul>
      </section>
    </div>
  );
}
