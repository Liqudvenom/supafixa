import type { AddressReport } from './clients'
import { profileById } from './profiles'
import type { ProfileId } from './profiles'
import type { Mode, View } from './types'

export type ProfileBoot = 'idle' | 'loading' | 'ready' | 'error'

export type Entitlements = {
  clientCheck: boolean
  marketplaceLayers: boolean
  riskMap: boolean
  importPosts: boolean
  reviews: boolean
  jobAddressHint: boolean
}

export type MapLayers = {
  showMarketplace: boolean
  showClientAddresses: boolean
  showRiskOverlay: boolean
}

export type ProfileEnvironment = {
  profileId: ProfileId
  entitlements: Entitlements
  defaultMode: Mode
  allowedModes: Mode[]
}

export type ProfileKpi = {
  value: number
  label: string
  note: string
}

export type DrawerClient = { report: AddressReport } | 'locked' | null

const BOOT_MS = 520

function wait(ms: number) {
  return new Promise((done) => setTimeout(done, ms))
}

/** Product defaults for a profile, including role-scoped marketplace views. */
export function profileEnvironment(profileId: ProfileId): ProfileEnvironment {
  const profile = profileById(profileId)
  return {
    profileId,
    entitlements: {
      clientCheck: profile.clientCheck,
      marketplaceLayers: true,
      riskMap: true,
      importPosts: true,
      reviews: true,
      jobAddressHint: profileId !== 'buyer',
    },
    defaultMode: profile.defaultMode,
    allowedModes: [...profile.allowedModes],
  }
}

/**
 * Resolves the workspace for a profile: entitlements, default map mode, allowed modes.
 *
 * Demo: in-memory mock plus a short delay so the loader is visible. Nothing is sent
 * to a server.
 *
 * Later this should call `GET /v1/me/profiles/:id/environment` and may prefetch
 * marketplace markers or Client Check addresses for the granted layers.
 */
export async function loadProfileEnvironment(profileId: ProfileId): Promise<ProfileEnvironment> {
  await wait(BOOT_MS)
  return profileEnvironment(profileId)
}

/**
 * Live Client Check grant.
 *
 * Only the business entitlement exposes Client Check. In production this
 * entitlement must also be verified by the server for the signed-in account.
 */
export function effectiveClientCheck(environment: ProfileEnvironment) {
  return environment.entitlements.clientCheck
}

export type ProfileUiStats = {
  reports: number
  flagged: number
  myReviews: number
  jobs: number
  workers: number
  companies: number
  urgent: number
  applied: number
  invited: number
  saved: number
}

export type ProfileUiCopy = {
  addresses: string
  addressesNote: string
  flagged: string
  flaggedNote: string
  myReviews: string
  myReviewsNote: string
  jobs: string
  jobsNote: string
  workers: string
  workersNote: string
  companies: string
  companiesNote: string
  urgent: string
  urgentNote: string
  myApps: string
  saved: string
  sessionNote: string
  invites: string
}

export type ProfileUiConfig = {
  clientCheck: boolean
  showAddresses: boolean
  mapLayers: MapLayers
  drawerClient: DrawerClient
  kpis: ProfileKpi[]
}

export function getProfileUiConfig(input: {
  environment: ProfileEnvironment
  view: View
  jobReport?: AddressReport
  stats: ProfileUiStats
  copy: ProfileUiCopy
}): ProfileUiConfig {
  const { environment, view, jobReport, stats, copy } = input
  const clientCheck = effectiveClientCheck(environment)
  const showAddresses = view === 'clients' && clientCheck
  const { entitlements } = environment

  const kpis: ProfileKpi[] =
    environment.profileId === 'business' && clientCheck
      ? [
          { value: stats.reports, label: copy.addresses, note: copy.addressesNote },
          { value: stats.flagged, label: copy.flagged, note: copy.flaggedNote },
          { value: stats.myReviews, label: copy.myReviews, note: copy.myReviewsNote },
          { value: stats.jobs, label: copy.jobs, note: copy.jobsNote },
        ]
      : environment.profileId === 'buyer'
        ? [
            { value: stats.workers, label: copy.workers, note: copy.workersNote },
            { value: stats.companies, label: copy.companies, note: copy.companiesNote },
            { value: stats.invited, label: copy.invites, note: copy.sessionNote },
            { value: stats.saved, label: copy.saved, note: copy.sessionNote },
          ]
        : [
            { value: stats.jobs, label: copy.jobs, note: copy.jobsNote },
            { value: stats.urgent, label: copy.urgent, note: copy.urgentNote },
            { value: stats.applied, label: copy.myApps, note: copy.sessionNote },
            { value: stats.saved, label: copy.saved, note: copy.sessionNote },
          ]

  return {
    clientCheck,
    showAddresses,
    mapLayers: {
      showMarketplace: entitlements.marketplaceLayers && !showAddresses,
      showClientAddresses: showAddresses,
      showRiskOverlay: view === 'risk' && entitlements.riskMap,
    },
    drawerClient:
      !jobReport || !entitlements.jobAddressHint ? null : clientCheck ? { report: jobReport } : 'locked',
    kpis,
  }
}

// TODO (phase 2): persist saved / applied / invited / enquired / last view per
// ProfileId (`tt-session:<id>`) so seller and buyer sessions do not mix. This
// iteration only stores `tt-profile`.
