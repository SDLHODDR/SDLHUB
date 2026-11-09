import { useCallback, useState } from 'react'
import { confirmAction, notifyError, notifySuccess } from '../../../../shared/services/alertService'
import { blockCandidate } from '../../services/recruitmentService'
import { BLOCK_AFTER_FOLLOW_UPS } from './recruitmentOptions'

/*
 * Legacy showFollowID: after 5 follow-ups the recruiter is first asked whether to
 * block the candidate; declining continues to the follow-up form.
 */
const useCandidateFollowUp = onChanged => {
  const [followUpTarget, setFollowUpTarget] = useState(null)

  const startFollowUp = useCallback(
    async (candidate, reqId) => {
      if (candidate.status !== 'B' && candidate.followUpCount >= BLOCK_AFTER_FOLLOW_UPS) {
        const block = await confirmAction(
          'Do you want to block the candidate?',
          `${candidate.name} has ${candidate.followUpCount} follow-ups. Blocking cannot be undone. Choose cancel to add another follow-up instead.`
        )
        if (block) {
          try {
            const response = await blockCandidate(candidate.id)
            if (!response?.status) throw new Error(response?.message)
            notifySuccess(response.message)
            onChanged()
          } catch (error) {
            notifyError(error?.message || 'Unable to block the candidate.')
          }
          return
        }
      }
      setFollowUpTarget({ candidate, reqId })
    },
    [onChanged]
  )

  return { followUpTarget, startFollowUp, closeFollowUp: () => setFollowUpTarget(null) }
}

export default useCandidateFollowUp
