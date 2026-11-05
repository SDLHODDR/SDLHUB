import ExitSeparationRequestModal from './ExitSeparationRequestModal'

// Deactivate Employee (23) uses the Employee Separation screen in deactivate mode.
const ExitDeactivateEmployeeModal = props => (
  <ExitSeparationRequestModal {...props} mode='deactivate' />
)

export default ExitDeactivateEmployeeModal
