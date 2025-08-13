import {getInput, setFailed} from '@actions/core'
import {context} from '@actions/github'
import {Input, NO_RETENTION} from './input'
import {Observable, throwError} from 'rxjs'
import {deleteVersions} from './delete'
import {catchError} from 'rxjs/operators'

function getActionInput(): Input {
  const ignoreVersionsInput = getInput('ignore-versions').trim()

  return new Input({
    packageVersionIds: getInput('package-version-ids')
      ? getInput('package-version-ids').split(',')
      : [],
    owner: getInput('owner') ? getInput('owner') : context.repo.owner,
    packageName: getInput('package-name'),
    packageType: getInput('package-type'),
    numOldVersionsToDelete: Number(getInput('num-old-versions-to-delete')),
    minVersionsToKeep: Number(getInput('min-versions-to-keep')),
    ignoreVersions: ignoreVersionsInput
      ? new RegExp(ignoreVersionsInput)
      : null,
    deletePreReleaseVersions: getInput(
      'delete-only-pre-release-versions'
    ).toLowerCase(),
    token: getInput('token'),
    deleteUntaggedVersions: getInput(
      'delete-only-untagged-versions'
    ).toLowerCase(),
    retentionDays: getInput('retention-days')
      ? Number(getInput('retention-days'))
      : NO_RETENTION
  })
}

function run(): Observable<boolean> {
  try {
    return deleteVersions(getActionInput()).pipe(
      catchError(err => throwError(err))
    )
  } catch (error) {
    if (error instanceof Error) {
      return throwError(error.message)
    }
    return throwError(error)
  }
}

run().subscribe({
  error: err => {
    setFailed(err)
  }
})
