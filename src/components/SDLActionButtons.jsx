//import React from "react";
import EditButton from '../portals/hrms/components/buttons/EditButton'
import DeleteButton from '../portals/hrms/components/buttons/DeleteButton'

const SDLActionButtons = ({ actions = [], row, showEmptyDash = false }) => {
  const visibleActions = actions.filter(
    action => !action.show || action.show(row)
  )

  if (visibleActions.length === 0) {
    return showEmptyDash ? (
      <div
        className='d-flex align-items-center justify-content-center'
        style={{ minWidth: '90px' }}
      >
        <span className='text-muted'>-</span>
      </div>
    ) : null
  }

  return (
    <div
      className='d-flex align-items-center justify-content-center gap-2'
      style={{ minWidth: '90px' }}
    >
      {visibleActions.map(action => {
        const isLoading = action.loading ? action.loading(row) : false
        const isDisabled =
          (action.disabled ? action.disabled(row) : false) || isLoading

        return (
          // <button
          //   key={action.key}
          //   type="button"
          //   className={`btn btn-sm ${action.className || "btn-outline-primary"} d-flex align-items-center justify-content-center`}
          //   onClick={() => !isDisabled && action.onClick(row)}
          //   disabled={isDisabled}
          //   aria-label={action.label}
          //   title={action.label}
          // >
          //   {isLoading ? (
          //     <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          //   ) : (
          //     <i className={action.icon} />
          //   )}
          // </button>

          <>
            {action.key === 'edit' ? (
              <EditButton
                key={action.key}
                onClick={() => !isDisabled && action.onClick(row)}
                disabled={isDisabled}
                ariaLabel={action.label}
              />
            ) : action.key === 'delete' ? (
              <DeleteButton
                key={action.key}
                onClick={() => !isDisabled && action.onClick(row)}
                disabled={isDisabled}
                loading={isLoading}
                ariaLabel={action.label}
              />
            ) : (
              <button
                key={action.key}
                type='button'
                className={`btn btn-sm ${
                  action.className || 'btn-outline-primary'
                } d-flex align-items-center justify-content-center`}
                onClick={() => !isDisabled && action.onClick(row)}
                disabled={isDisabled}
                aria-label={action.label}
                title={action.label}
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0
                }}
              >
                {isLoading ? (
                  <span
                    className='spinner-border spinner-border-sm'
                    role='status'
                    aria-hidden='true'
                  />
                ) : (
                  <i className={action.icon} />
                )}
              </button>
            )}
          </>
        )
      })}
    </div>
  )
}

export default SDLActionButtons
