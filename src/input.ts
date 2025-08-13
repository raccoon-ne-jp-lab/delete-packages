export interface InputParams {
  packageVersionIds?: string[]
  owner?: string
  packageName?: string
  packageType?: string
  numOldVersionsToDelete?: number
  minVersionsToKeep?: number
  ignoreVersions?: RegExp | null
  token?: string
  retentionDays?: number
  deletePreReleaseVersions?: string
  deleteUntaggedVersions?: string
}

export const NO_RETENTION = -1

const defaultParams = {
  packageVersionIds: [],
  owner: '',
  packageName: '',
  packageType: '',
  numOldVersionsToDelete: 0,
  minVersionsToKeep: 0,
  ignoreVersions: null,
  deletePreReleaseVersions: '',
  token: '',
  deleteUntaggedVersions: '',
  retentionDays: NO_RETENTION
}

export class Input {
  packageVersionIds: string[]
  owner: string
  packageName: string
  packageType: string
  numOldVersionsToDelete: number
  minVersionsToKeep: number
  ignoreVersions: RegExp | null
  deletePreReleaseVersions: string
  token: string
  numDeleted: number
  deleteUntaggedVersions: string
  retentionDays: number

  constructor(params?: InputParams) {
    const validatedParams: Required<InputParams> = {...defaultParams, ...params}

    this.packageVersionIds = validatedParams.packageVersionIds
    this.owner = validatedParams.owner
    this.packageName = validatedParams.packageName
    this.packageType = validatedParams.packageType
    this.numOldVersionsToDelete = validatedParams.numOldVersionsToDelete
    this.minVersionsToKeep = validatedParams.minVersionsToKeep
    this.ignoreVersions = validatedParams.ignoreVersions
    this.deletePreReleaseVersions = validatedParams.deletePreReleaseVersions
    this.token = validatedParams.token
    this.numDeleted = 0
    this.deleteUntaggedVersions = validatedParams.deleteUntaggedVersions
    this.retentionDays = validatedParams.retentionDays
  }

  hasOldestVersionQueryInfo(): boolean {
    return !!(
      this.owner &&
      this.packageName &&
      this.numOldVersionsToDelete >= 0 &&
      this.token
    )
  }

  checkInput(): boolean {
    if (this.packageType.toLowerCase() !== 'container') {
      this.deleteUntaggedVersions = 'false'
    }

    if (
      this.numOldVersionsToDelete > 1 &&
      (this.minVersionsToKeep >= 0 ||
        this.deletePreReleaseVersions === 'true' ||
        this.deleteUntaggedVersions === 'true' ||
        this.retentionDays !== NO_RETENTION)
    ) {
      return false
    }

    if (this.packageType === '' || this.packageName === '') {
      return false
    }

    if (
      this.retentionDays !== NO_RETENTION &&
      !Number.isSafeInteger(this.retentionDays)
    ) {
      return false
    }

    if (this.deletePreReleaseVersions === 'true') {
      this.minVersionsToKeep =
        this.minVersionsToKeep > 0 ? this.minVersionsToKeep : 0
      this.ignoreVersions = new RegExp('^(0|[1-9]\\d*)((\\.(0|[1-9]\\d*))*)$')
    }

    if (this.deleteUntaggedVersions === 'true') {
      this.minVersionsToKeep =
        this.minVersionsToKeep > 0 ? this.minVersionsToKeep : 0
    }

    if (this.minVersionsToKeep >= 0) {
      this.numOldVersionsToDelete = 0
    }

    return true
  }
}
