import Link from "next/link";
import { FiArrowRight, FiMap, FiCamera, FiTrendingUp, FiActivity } from "react-icons/fi";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={`badge badge-teal animate-slide-up`} style={{ marginBottom: "1.5rem" }}>
            <span>ADVAYA 2.0 Finalist</span>
          </div>
          <h1 className={`${styles.title} animate-slide-up`} style={{ animationDelay: "0.1s" }}>
            Marine Intelligence <br />
            <span className="text-gradient">For The Gulf of Mannar</span>
          </h1>
          <p className={`${styles.subtitle} animate-slide-up`} style={{ animationDelay: "0.2s" }}>
            Marine pollution isn't a reporting problem — it's a tracing problem. 
            We use AI to detect threats, map reverse currents to find the source, 
            and predict the economic cascade before it happens.
          </p>
          <div className={`${styles.ctaGroup} animate-slide-up`} style={{ animationDelay: "0.3s" }}>
            <Link href="/map" className="btn btn-primary btn-lg">
              Open Live Map <FiArrowRight />
            </Link>
            <Link href="/detect" className="btn btn-secondary btn-lg glass">
              Report Pollution
            </Link>
          </div>
        </div>

        <div className={`${styles.statsGrid} animate-fade-in`} style={{ animationDelay: "0.5s" }}>
          <div className={`${styles.statCard} glass`}>
            <h3>12 Active</h3>
            <p>Pollution Threats</p>
          </div>
          <div className={`${styles.statCard} glass`}>
            <h3>₹ 1.2L/day</h3>
            <p>Risk Exposure</p>
          </div>
          <div className={`${styles.statCard} glass`}>
            <h3>87% CI</h3>
            <p>Tracer Accuracy</p>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featureGrid}>
          <Link href="/map" className={`${styles.featureCard} glass-strong animate-slide-up stagger-item`}>
            <div className={styles.iconWrapper} style={{ background: "rgba(0, 210, 211, 0.15)", color: "var(--teal)" }}>
              <FiMap className="icon" />
            </div>
            <h2>Live Map</h2>
            <p>Multi-layer intelligence combining public reports, satellite data, fishing zones, and currents.</p>
          </Link>
          
          <Link href="/detect" className={`${styles.featureCard} glass-strong animate-slide-up stagger-item`}>
            <div className={styles.iconWrapper} style={{ background: "rgba(255, 193, 7, 0.15)", color: "var(--amber)" }}>
              <FiCamera className="icon" />
            </div>
            <h2>AI Detector</h2>
            <p>Upload any photo of ocean water. Gemini Vision instantly identifies pollution type and severity.</p>
          </Link>

          <Link href="/tracer" className={`${styles.featureCard} glass-strong animate-slide-up stagger-item`}>
            <div className={styles.iconWrapper} style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--purple-light)" }}>
              <FiTrendingUp className="icon" />
            </div>
            <h2>Reverse Tracer</h2>
            <p>Find the polluter. Animated reverse-current dispersion models pinpoint exactly where the discharge originated.</p>
          </Link>

          <Link href="/biodiversity" className={`${styles.featureCard} glass-strong animate-slide-up stagger-item`}>
            <div className={styles.iconWrapper} style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--emerald)" }}>
              <FiActivity className="icon" />
            </div>
            <h2>Cascade Predictor</h2>
            <p>Interactive species dependency graph. Watch the timeline of what dies next, and how much it costs.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
