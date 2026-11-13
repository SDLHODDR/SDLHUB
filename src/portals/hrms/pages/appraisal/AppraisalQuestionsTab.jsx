import { useState } from 'react'
import SaveButton from '../../../../shared/components/buttons/SaveButton'
import SDLReactSelect from '../../../../shared/components/form/SDLReactSelect'
import { getAppraisalGroupQuestions } from '../../services/appraisalService'

/* Questions of the appraisal by group, in display order. While New: reorder, delete a question or a group. */
const QuestionList = ({ groups, editable, busy, onMove, onDelete, onDeleteGroup }) => (
  <div className='table-responsive'>
    <table className='table table-bordered table-sm align-middle mb-0 appraisal-table'>
      <thead>
        <tr>
          <th style={{ width: '3rem' }}>#</th>
          <th style={{ width: '6rem' }} className='text-center'>Display Sequence</th>
          <th style={{ width: '9rem' }}>SubGroup</th>
          <th>Questions</th>
          {editable && <th style={{ width: '3rem' }} />}
          <th style={{ width: '4rem' }} className='text-center'>Count</th>
        </tr>
      </thead>
      <tbody>
        {groups.length === 0 && (
          <tr>
            <td colSpan={editable ? 6 : 5} className='text-center text-muted'>
              No questions added yet.
            </td>
          </tr>
        )}
        {groups.map((group, groupIndex) => [
          <tr key={`g-${group.id}`} className='appraisal-group-row'>
            <td className='text-center'>{groupIndex + 1}</td>
            <td colSpan={3} className='fw-semibold'>
              {group.name}
            </td>
            {editable && (
              <td className='text-center'>
                <button
                  type='button'
                  className='btn btn-link text-danger p-0'
                  title='Delete Group'
                  aria-label={`Delete the ${group.name} group`}
                  disabled={busy}
                  onClick={() => onDeleteGroup(group)}
                >
                  <i className='ti ti-trash' />
                </button>
              </td>
            )}
            <td className='text-center'>#{group.questions.length}</td>
          </tr>,
          ...group.questions.map((question, index) => (
            <tr key={question.id}>
              <td />
              <td className='text-center'>
                {editable ? (
                  <div className='d-flex align-items-center justify-content-center gap-1'>
                    <button
                      type='button'
                      className='btn btn-link p-0'
                      aria-label='Move up'
                      disabled={busy || index === 0}
                      onClick={() => onMove(question, 'up')}
                    >
                      <i className='ti ti-chevron-up' />
                    </button>
                    <span>{question.sequence}</span>
                    <button
                      type='button'
                      className='btn btn-link p-0'
                      aria-label='Move down'
                      disabled={busy || index === group.questions.length - 1}
                      onClick={() => onMove(question, 'down')}
                    >
                      <i className='ti ti-chevron-down' />
                    </button>
                  </div>
                ) : (
                  question.sequence
                )}
              </td>
              <td>{question.subgroup || '-'}</td>
              <td>{question.question}</td>
              {editable && (
                <td className='text-center'>
                  <button
                    type='button'
                    className='btn btn-link text-danger p-0'
                    title='Delete'
                    aria-label='Delete question'
                    disabled={busy}
                    onClick={() => onDelete(question)}
                  >
                    <i className='ti ti-trash' />
                  </button>
                </td>
              )}
              <td />
            </tr>
          ))
        ])}
      </tbody>
    </table>
  </div>
)

/* Question Master tab (legacy appraisal_setup.php tab 2): add a group's questions, order and remove them. */
const AppraisalQuestionsTab = ({ detail, busy, run }) => {
  const { appraisal } = detail
  const editable = appraisal.status === 'N'
  const [groupId, setGroupId] = useState('')
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(() => new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadGroup = value => {
    setGroupId(value || '')
    setQuestions([])
    setSelected(new Set())
    setError('')
    if (!value) return
    setLoading(true)
    getAppraisalGroupQuestions(appraisal.id, value)
      .then(response => {
        if (!response?.status) throw new Error(response?.message)
        const list = response.data.questions || []
        setQuestions(list)
        // New questions start ticked; those already in the appraisal are locked (legacy).
        setSelected(new Set(list.filter(question => !question.added).map(question => question.id)))
      })
      .catch(loadError => setError(loadError?.message || 'Unable to load the questions.'))
      .finally(() => setLoading(false))
  }

  const toggle = id =>
    setSelected(current => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const add = async () => {
    if (selected.size === 0) {
      setError('Please select one or more questions.')
      return
    }
    const done = await run({ action: 'add_questions', question_ids: [...selected] })
    if (done) loadGroup(groupId)
  }

  const list = (
    <QuestionList
      groups={detail.questionGroups}
      editable={editable}
      busy={busy}
      onMove={(question, direction) => run({ action: 'move_question', question_id: question.id, direction })}
      onDelete={question =>
        run({ action: 'delete_question', question_id: question.id }, ['Delete this question?', "You won't be able to revert this!"])
      }
      onDeleteGroup={group =>
        run({ action: 'delete_group', group_id: group.id }, ['Delete this question group?', 'This will delete the entire question group!'])
      }
    />
  )

  return (
    <>
      <label className='form-label fw-semibold'>
        Appraisal: {appraisal.description}({appraisal.id})
      </label>
      {!editable ? (
        list
      ) : (
        <div className='row g-3'>
          <div className='col-lg-5'>
            <label className='form-label'>Question Groups</label>
            <SDLReactSelect value={groupId} options={detail.groupOptions || []} placeholder='Please Select Question Group' onChange={loadGroup} />
            {loading && <div className='text-muted small mt-2'>Loading questions...</div>}
            {error && <small className='text-danger d-block mt-1'>{error}</small>}
            {groupId && !loading && (
              <>
                <div className='table-responsive mt-3'>
                  <table className='table table-bordered table-sm align-middle mb-0 appraisal-table'>
                    <thead>
                      <tr>
                        <th style={{ width: '3rem' }} />
                        <th>Questions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.length === 0 && (
                        <tr>
                          <td colSpan={2} className='text-center text-muted'>
                            No active questions in this group.
                          </td>
                        </tr>
                      )}
                      {questions.map(question => (
                        <tr key={question.id}>
                          <td className='text-center'>
                            <input
                              type='checkbox'
                              className='form-check-input'
                              aria-label={question.question}
                              checked={question.added || selected.has(question.id)}
                              disabled={question.added || busy}
                              onChange={() => toggle(question.id)}
                            />
                          </td>
                          <td>
                            {question.question}
                            {question.added && <span className='badge bg-secondary ms-2'>Added</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='d-flex justify-content-center gap-2 mt-3'>
                  <SaveButton onClick={add} isSubmitting={busy} disabled={selected.size === 0} />
                </div>
              </>
            )}
          </div>
          <div className='col-lg-7'>
            <label className='form-label'>List Of Questions</label>
            {list}
          </div>
        </div>
      )}
    </>
  )
}

export default AppraisalQuestionsTab
