/** Maps raw public project API payload into showroom view model. */

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeMilestones(rows) {
  return asArray(rows).map((row) => {
    if (typeof row === 'string') {
      return { title: row, description: row, status: 'pending', progress: 0 };
    }
    return {
      title: String(row.title || row.label || 'Milestone'),
      description: String(row.description || row.title || row.label || 'Milestone'),
      status: String(row.status || 'pending').toLowerCase(),
      progress: Number(row.progress || 0),
    };
  });
}

function milestoneStatusLabel(milestone) {
  const status = String(milestone?.status || '').toLowerCase();
  if (status === 'completed') return 'Completed';
  if (status === 'in-progress') return `${milestone.progress || 0}% complete`;
  return milestone.description || milestone.title || 'Scheduled';
}

function buildMetrics(projectData) {
  const seo = projectData?.seo_metrics || {};
  if (asArray(projectData?.metrics).length) {
    return asArray(projectData.metrics).map((metric) => ({
      ...metric,
      barPercent: Number(
        metric.barPercent ||
          (metric.id === 'performance' ? projectData.performance_percentage : 0) ||
          0,
      ),
    }));
  }
  const performance = Number(seo.performance_percentage || projectData.performance_percentage || 98);
  return [
    { id: 'traffic', label: 'Organic Traffic', value: seo.organic_traffic || '12.4K', delta: '+18.6% (30 days)', tone: 'green', barPercent: 78 },
    { id: 'keywords', label: 'Keyword Ranking', value: seo.keyword_ranking || '325', hint: 'Top 10 Keywords', tone: 'violet', barPercent: 65 },
    { id: 'backlinks', label: 'Backlinks', value: seo.backlinks || '1.8K', delta: '+21.3% (30 days)', tone: 'blue', barPercent: 72 },
    { id: 'seo_score', label: 'SEO Score', value: seo.seo_score || '92/100', hint: 'Excellent', tone: 'green', barPercent: 92 },
    { id: 'performance', label: 'Performance', value: `${performance}%`, hint: 'Core Web Vitals', tone: 'green', barPercent: performance },
  ];
}

function buildRecentActivity(projectData, milestones) {
  const feed = asArray(projectData.recentActivity || projectData.recent_activity);
  if (feed.length) {
    return feed.map((item) => ({
      title: String(item.title || item.text || 'Project activity'),
      detail: String(item.detail || item.description || item.title || item.text || ''),
      status: String(item.status || 'completed').toLowerCase(),
    }));
  }
  return milestones.slice(0, 4).map((milestone) => ({
    title: milestone.title,
    detail: milestone.description,
    status: milestone.status,
  }));
}

export function mapPublicProjectShowroom(raw = {}) {
  const milestones = normalizeMilestones(raw.milestones);
  const performancePercentage = Number(
    raw.performance_percentage || raw.seo_metrics?.performance_percentage || 75,
  );

  return {
    ...raw,
    imageurl: String(raw.imageurl || raw.imageUrl || raw.previewImageUrl || '').trim(),
    techStackTags: asArray(raw.techStackTags || raw.tech_stack || raw.tags),
    publicPortfolioLinks: asArray(raw.publicPortfolioLinks),
    milestones: milestones.map((milestone) => ({
      ...milestone,
      statusLabel: milestoneStatusLabel(milestone),
    })),
    metrics: buildMetrics(raw),
    seo_metrics: {
      organic_traffic: raw.seo_metrics?.organic_traffic || '12.4K',
      keyword_ranking: raw.seo_metrics?.keyword_ranking || '325',
      backlinks: raw.seo_metrics?.backlinks || '1.8K',
      seo_score: raw.seo_metrics?.seo_score || '92/100',
      performance_percentage: performancePercentage,
    },
    performance_percentage: performancePercentage,
    recentActivity: buildRecentActivity(raw, milestones),
    milestoneProgress: Number(raw.milestoneProgress || performancePercentage || 75),
  };
}

export function metricBarWidth(metric, projectData) {
  const fromMetric = Number(metric?.barPercent || 0);
  if (fromMetric > 0) return Math.min(100, fromMetric);
  if (metric?.id === 'performance') {
    return Math.min(100, Number(projectData?.performance_percentage || 0));
  }
  return 55;
}
