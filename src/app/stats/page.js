'use client';

import { useEffect, useRef, useState } from 'react';
import ScrollReveal from '@/components/ScrollReveal';
import styles from './stats.module.css';

function animateCount(start, end, duration, callback) {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    callback(Math.floor(start + (end - start) * eased));
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function StatCard({ icon, target, suffix = '', label, delay = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          animateCount(0, target, 2000, setCount);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <ScrollReveal delay={delay}>
      <div className={styles.statCard} ref={ref}>
        <div className={styles.statIcon}>{icon}</div>
        <div className={styles.statNumber}>
          {count.toLocaleString()}{suffix}
        </div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </ScrollReveal>
  );
}

const stats = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/>
      </svg>
    ),
    target: 15247,
    label: 'Messages Created',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    ),
    target: 12893,
    label: 'Messages Burned',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    target: 99,
    suffix: '.9%',
    label: 'Uptime',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    target: 42,
    label: 'Countries Served',
  },
];

export default function StatsPage() {
  return (
    <div className={styles.statsPage}>
      <div className={styles.hero}>
        <h1>Platform Stats</h1>
        <p>BurnMsg by the numbers</p>
      </div>

      <div className={styles.grid}>
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            icon={stat.icon}
            target={stat.target}
            suffix={stat.suffix}
            label={stat.label}
            delay={i * 100}
          />
        ))}
      </div>

      <p className={styles.note}>
        Stats are approximate and updated periodically.
      </p>
    </div>
  );
}
