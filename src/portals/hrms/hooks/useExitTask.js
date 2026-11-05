import { useCallback, useEffect, useState } from 'react'
import { getExitTaskDetails } from '../services/exitService'
import { notifySuccess } from '../../../shared/services/alertService'

/*
 * Loads an Exit task's details and runs its actions. `run` sends the request,
 * and on success notifies, refreshes the task list/counts and closes the
 * modal when `close` is set (task moved forward); otherwise shows the error.
 */
const useExitTask = ({ record, onClose, onSuccess }) => {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [actionError, setActionError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  // The modal mounts once per task, so the initial loading state covers the
  // first load; reload() refreshes the details in place.
  useEffect(() => {
    let active = true
    getExitTaskDetails({ taskId: record?.TASK_ID, userTaskId: record?.ID })
      .then(response => {
        if (!active) return
        if (!response?.status) {
          throw new Error(response?.message || 'Unable to load task details.')
        }
        setDetails(response.data)
      })
      .catch(error => {
        if (active && !error?.cancelled) {
          setLoadError(error?.message || 'Unable to load task details.')
        }
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [record?.ID, record?.TASK_ID, reloadKey])

  const reload = useCallback(() => setReloadKey(key => key + 1), [])

  const run = useCallback(
    async (action, request, { close = false } = {}) => {
      setBusyAction(action)
      setActionError('')
      try {
        const response = await request()
        if (!response?.status) {
          throw new Error(response?.message || 'The request could not be completed.')
        }
        notifySuccess(response.message)
        if (close) {
          window.dispatchEvent(new Event('hrms-auth-tasks-changed'))
          onSuccess?.()
          onClose?.()
        }
        return true
      } catch (error) {
        setActionError(error?.message || 'The request could not be completed.')
        return false
      } finally {
        setBusyAction('')
      }
    },
    [onClose, onSuccess]
  )

  return { details, loading, loadError, busyAction, actionError, run, reload }
}

export default useExitTask
