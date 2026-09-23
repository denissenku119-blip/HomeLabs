/**
 * Sharing a project.
 *
 * Projects live on the device only, so there is no public URL to hand out and
 * we never pretend there is one. Instead we share a readable text summary of
 * the design plus the store link, through the native sheet, the Web Share API
 * or the clipboard.
 */
import type { Project } from '@/types';
import { calculateProjectMetrics } from '@/features/calculations/calculationEngine';
import { shareContent, type ShareResult } from '@/services/share.service';
import { PLAY_STORE_URL } from '@/features/share/shareApp';
import { APP_NAME } from '@/config/app';
import { translate } from '@/i18n/translate';

function money(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

/** Readable, self-contained plain-text summary of a saved project. */
export function buildProjectSummary(project: Project, langId = 'en'): string {
  const t = (key: string, params?: Record<string, string | number>) => translate(key, langId, params);
  const metrics = calculateProjectMetrics(project, {
    electricityCostPerKwh: project.electricityCostPerKwh,
  });
  const currency = project.currency || 'USD';
  const byId = new Map(project.components.map((c) => [c.instanceId, c.name]));

  const lines: string[] = [];
  lines.push(project.name);
  lines.push('');

  lines.push(t('share.components', { count: project.components.length }));
  if (project.components.length === 0) {
    lines.push(`- ${t('common.noneYet')}`);
  } else {
    for (const c of project.components) {
      const bits: string[] = [c.category];
      if (c.powerWatts > 0) bits.push(`${c.powerWatts} W`);
      if (c.storageTB > 0) bits.push(`${c.storageTB} TB`);
      if (c.price > 0) bits.push(money(c.price, c.currency || currency));
      lines.push(`- ${c.name} (${bits.join(', ')})`);
    }
  }
  lines.push('');

  lines.push(t('share.connections', { count: project.connections.length }));
  if (project.connections.length === 0) {
    lines.push(`- ${t('common.noneYet')}`);
  } else {
    for (const conn of project.connections) {
      const from = byId.get(conn.fromId) ?? t('share.unknown');
      const to = byId.get(conn.toId) ?? t('share.unknown');
      lines.push(`- ${from} → ${to} (${conn.type})`);
    }
  }
  lines.push('');

  lines.push(t('share.summary'));
  lines.push(`- ${t('share.estimatedCost', { value: money(metrics.cost.totalKnownCost, currency) })}`);
  if (metrics.cost.unpricedComponentCount > 0) {
    lines.push(`- ${t('share.unpriced', { count: metrics.cost.unpricedComponentCount })}`);
  }
  lines.push(`- ${t('share.power', { value: Math.round(metrics.power.totalKnownPowerWatts) })}`);
  if (metrics.energy.hasPowerData) {
    lines.push(
      `- ${t('share.running', { value: money(metrics.energy.monthlyCost, currency), kwh: Math.round(metrics.energy.annualKwh) })}`
    );
  }
  if (metrics.storage.hasStorageData) {
    lines.push(`- ${t('share.rawStorage', { value: metrics.storage.totalRawStorageTB })}`);
  }
  if (metrics.network.fastestInterfaceGbps != null) {
    lines.push(`- ${t('share.fastest', { value: metrics.network.fastestInterfaceGbps })}`);
  }
  if (metrics.budget.budget != null) {
    lines.push(
      metrics.budget.isOverBudget
        ? `- ${t('share.overBudget', { value: money(metrics.budget.overAmount ?? 0, currency) })}`
        : `- ${t('share.remaining', { value: money(metrics.budget.remaining ?? 0, currency) })}`
    );
  }
  lines.push('');

  lines.push(t('share.created', { app: APP_NAME }));
  lines.push(PLAY_STORE_URL);

  return lines.join('\n');
}

export async function shareProject(project: Project, langId = 'en'): Promise<ShareResult & { text: string }> {
  const text = buildProjectSummary(project, langId);
  // The summary already ends with the store link; passing `url` as well would
  // duplicate it in the native sheet.
  const result = await shareContent({
    title: `${project.name} — ${APP_NAME}`,
    text,
  });
  return { ...result, text };
}
