/** Shared manifest item field validation — keep in sync with haus-workflow manifest-item-fields.ts */

import { HTTP_URL_PATTERN } from './validation-rules.mjs'

export const USE_MODES = new Set(['copy', 'adapted', 'wrapped', 'rewritten', 'reference-only'])
export const LICENSE_CONFIDENCES = new Set(['high', 'medium', 'low', 'unknown'])
export const REVIEW_STATUSES = new Set([
  'approved',
  'candidate',
  'needs-review',
  'rejected',
  'deprecated',
])
export const RISK_LEVELS = new Set(['low', 'medium', 'high', 'blocked'])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

export function validateReferences(itemId, references) {
  if (references === undefined) return null
  if (!isStringArray(references)) return `${itemId}: references must be a string array`
  for (const ref of references) {
    if (/^https?:\/\//i.test(ref)) {
      if (!ref.startsWith('https://')) {
        return `${itemId}: reference must be https:// URL: ${ref}`
      }
      if (HTTP_URL_PATTERN.test(ref)) {
        return `${itemId}: reference uses insecure http:// URL: ${ref}`
      }
    }
  }
  return null
}

export function validateCuratedProvenance(item) {
  if (item.source !== 'curated') return null
  if (!isNonEmptyString(item.reviewStatus)) {
    return `${item.id}: curated item missing reviewStatus`
  }
  if (!REVIEW_STATUSES.has(item.reviewStatus)) {
    return `${item.id}: invalid reviewStatus "${item.reviewStatus}"`
  }
  if (!isNonEmptyString(item.riskLevel)) {
    return `${item.id}: curated item missing riskLevel`
  }
  if (!RISK_LEVELS.has(item.riskLevel)) {
    return `${item.id}: invalid riskLevel "${item.riskLevel}"`
  }
  if (!isNonEmptyString(item.originSourceId)) {
    return `${item.id}: curated item missing originSourceId`
  }
  if (!isNonEmptyString(item.originUrl)) {
    return `${item.id}: curated item missing originUrl`
  }
  if (!isNonEmptyString(item.useMode)) {
    return `${item.id}: curated item missing useMode`
  }
  if (!USE_MODES.has(item.useMode)) {
    return `${item.id}: invalid useMode "${item.useMode}"`
  }
  if (!isNonEmptyString(item.license)) {
    return `${item.id}: curated item missing license`
  }
  if (!isNonEmptyString(item.licenseConfidence)) {
    return `${item.id}: curated item missing licenseConfidence`
  }
  if (!LICENSE_CONFIDENCES.has(item.licenseConfidence)) {
    return `${item.id}: invalid licenseConfidence "${item.licenseConfidence}"`
  }
  if (typeof item.originUrl !== 'string' || !item.originUrl.startsWith('https://')) {
    return `${item.id}: originUrl must be an https:// URL`
  }
  return null
}
