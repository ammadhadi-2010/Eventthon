import React from 'react';

function rowsFromSeo(seo = {}) {
  return [
    { id: 'traffic', label: 'Organic Traffic', value: seo.organic_traffic || '12.4K', delta: '+18.6% (30 days)', tone: 'green' },
    { id: 'keywords', label: 'Keyword Ranking', value: seo.keyword_ranking || '325', hint: 'Top 10 Keywords', tone: 'violet' },
    { id: 'backlinks', label: 'Backlinks', value: seo.backlinks || '1.8K', delta: '+21.3% (30 days)', tone: 'blue' },
    { id: 'seo_score', label: 'SEO Score', value: seo.seo_score || '92/100', hint: 'Excellent', tone: 'green' },
    { id: 'performance', label: 'Performance', value: `${seo.performance_percentage || 98}%`, hint: 'Core Web Vitals', tone: 'green' },
  ];
}

export default function ProjectShowroomMetrics({ metrics, seoMetrics }) {
  const rows = metrics?.length ? metrics : rowsFromSeo(seoMetrics);

  return (
    <section className="ps-metrics" aria-label="Project metrics">
      {rows.map((metric) => (
        <article key={metric.id || metric.label} className={`ps-metric ps-metric--${metric.tone || 'blue'}`}>
          <p className="ps-metric__label">{metric.label}</p>
          <p className="ps-metric__value">{metric.value}</p>
          {metric.delta ? <p className="ps-metric__delta">{metric.delta}</p> : null}
          {metric.hint ? <p className="ps-metric__hint">{metric.hint}</p> : null}
        </article>
      ))}
    </section>
  );
}
