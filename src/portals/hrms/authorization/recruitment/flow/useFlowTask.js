import { useCallback, useEffect, useRef, useState } from 'react'
import { confirmAction, notifySuccess } from '../../../../../shared/services/alertService'
import { getRecruitmentFlowTask, processRecruitmentFlowTask } from '../../../services/recruitmentService'

/**
 * Loads a recruitment flow task (6-22) and runs its actions.
 * run(action, payload, { confirm: [title, text], close: true }) saves, then reloads the task
 * or (close) hands control back to the list. onLoaded(data) seeds form state after each load.
 */
export const useFlowTask = ({ taskId, record, onSuccess, onLoaded }) => {
  const [details, setDetails] = useState(null)
  // Latest onLoaded, called with every (re)load to seed the form from the saved values.
  const onLoadedRef = useRef(onLoaded)
  useEffect(() => {
    onLoadedRef.current = onLoaded
  })
  const [loadError, setLoadError] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const load = useCallback(() => {
    let active = true
    getRecruitmentFlowTask({ taskId, userTaskId: record.ID })
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        if (!active) return
        setDetails(response.data)
        onLoadedRef.current?.(response.data)
      })
      .catch(error => {
        if (active) setLoadError(error?.message || 'Unable to load the task.')
      })
    return () => {
      active = false
    }
  }, [taskId, record.ID])

  useEffect(() => load(), [load])

  const run = async (action, payload = {}, { confirm, close = false } = {}) => {
    if (confirm) {
      const confirmed = await confirmAction(...confirm)
      if (!confirmed) return false
    }
    setBusy(true)
    setActionError('')
    try {
      const response = await processRecruitmentFlowTask({
        task_id: taskId,
        user_task_id: record.ID,
        action,
        ...payload
      })
      if (!response?.status) throw new Error(response?.message)
      notifySuccess(response.message)
      if (close) onSuccess()
      else load()
      return true
    } catch (error) {
      setActionError(error?.message || 'Unable to process the task.')
      return false
    } finally {
      setBusy(false)
    }
  }

  return { details, loadError, busy, actionError, setActionError, run }
}


/** Rupee amount (Indian grouping) without decimals when whole. */
export const formatAmount = value => {
  const number = Number(value)
  if (!Number.isFinite(number)) return ''
  return number.toLocaleString('en-IN', { maximumFractionDigits: 2 })
}
