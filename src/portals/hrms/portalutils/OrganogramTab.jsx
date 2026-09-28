import useOrganogramFormHandler from "./useOrganogramFormHandler";
import SDLReactSelect from "../../../components/SDLReactSelect";
import { isOrganogramReadOnly } from "./organogramStatus";
//import Select from "react-select";
import SDLInput from '../../../components/SDLInput'
import SaveButton from '../components/buttons/SaveButton'
import CancelButton from '../components/buttons/CancelButton'

const OrganogramTab = ({ organogramId, organogramStatus, onOrganogramSaved }) => {
  //const isEditMode = !!organogramId;

  const {
    formData,
    errors,
    saving,
    loadingDetails,
    handleFieldChange,
    handleSave,
    handleCancel,
    finEntityOptions,
    companyOptions,
    departmentOptions,
    designationOptions,
    jdLabelOptions,
    divisionOptions,
    empLevelOptions,
    orgLevelOptions,
    loadingMasters,
    loadingDesignations,
    loadingJdLabels,
    isEditMode,
    canSendForAuth,
  } = useOrganogramFormHandler(organogramId, onOrganogramSaved);
  const isReadOnly = isOrganogramReadOnly(organogramStatus || formData.STATUS);

  return (
    <div>
      <div className='row'>
        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>
            Fin Entity<span className='text-danger ms-1'>*</span>
          </label>

          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.FIN_ENTITY_ID}
            options={finEntityOptions}
            onChange={value => handleFieldChange('FIN_ENTITY_ID', value)}
            hasError={!!errors.FIN_ENTITY_ID}
            isLoading={loadingMasters}
            isDisabled={loadingMasters}
            width='100%'
          />
          {errors.FIN_ENTITY_ID && (
            <div className='invalid-feedback d-block'>
              {errors.FIN_ENTITY_ID}
            </div>
          )}
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>
            Company<span className='text-danger ms-1'>*</span>
          </label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.COMPANY_ID}
            options={companyOptions}
            onChange={value => handleFieldChange('COMPANY_ID', value)}
            hasError={!!errors.COMPANY_ID}
            isLoading={loadingMasters}
            isDisabled={loadingMasters}
            width='100%'
          />
          {errors.COMPANY_ID && (
            <div className='invalid-feedback d-block'>{errors.COMPANY_ID}</div>
          )}
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>
            Department<span className='text-danger ms-1'>*</span>
          </label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.DEPARTMENT_ID}
            options={departmentOptions}
            onChange={value => handleFieldChange('DEPARTMENT_ID', value)}
            hasError={!!errors.DEPARTMENT_ID}
            isLoading={loadingMasters}
            isDisabled={loadingMasters}
            width='100%'
          />
          {errors.DEPARTMENT_ID && (
            <div className='invalid-feedback d-block'>
              {errors.DEPARTMENT_ID}
            </div>
          )}
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>Designation</label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.DESIGNATION_ID}
            options={designationOptions}
            onChange={value => handleFieldChange('DESIGNATION_ID', value)}
            hasError={!!errors.DESIGNATION_ID}
            isLoading={loadingDesignations}
            isDisabled={!formData.DEPARTMENT_ID || loadingDesignations}
            width='100%'
          />
          {errors.DESIGNATION_ID && (
            <div className='invalid-feedback d-block'>
              {errors.DESIGNATION_ID}
            </div>
          )}
        </div>

        {/* ROW 2 - JD Label, Division, Employee Level, Organogram Level */}

        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>
            Organogram Level<span className='text-danger ms-1'>*</span>
          </label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.ORG_LEVEL_ID}
            options={orgLevelOptions}
            onChange={value => handleFieldChange('ORG_LEVEL_ID', value)}
            hasError={!!errors.ORG_LEVEL_ID}
            isLoading={loadingMasters}
            isDisabled={loadingMasters}
            width='100%'
          />
          {errors.ORG_LEVEL_ID && (
            <div className='invalid-feedback d-block'>
              {errors.ORG_LEVEL_ID}
            </div>
          )}
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>JD Label</label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.JD_LABEL_ID}
            options={jdLabelOptions}
            onChange={value => handleFieldChange('JD_LABEL_ID', value)}
            hasError={!!errors.JD_LABEL_ID}
            isLoading={loadingJdLabels}
            isDisabled={!formData.DESIGNATION_ID || loadingJdLabels}
            width='100%'
          />
          {errors.JD_LABEL_ID && (
            <div className='invalid-feedback d-block'>{errors.JD_LABEL_ID}</div>
          )}
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          <label className='form-label'>
            Division<span className='text-danger ms-1'>*</span>
          </label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.DIVISION_ID}
            options={divisionOptions}
            onChange={value => handleFieldChange('DIVISION_ID', value)}
            hasError={!!errors.DIVISION_ID}
            isLoading={loadingMasters}
            isDisabled={loadingMasters}
            width='100%'
          />
          {errors.DIVISION_ID && (
            <div className='invalid-feedback d-block'>{errors.DIVISION_ID}</div>
          )}
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          {' '}
          <label className='form-label'>
            Employee Level<span className='text-danger ms-1'>*</span>
          </label>
          <SDLReactSelect
            classNamePrefix='react-select'
            className='js-example-basic-single select2'
            value={formData.EMP_LEVEL_ID}
            options={empLevelOptions}
            onChange={value => handleFieldChange('EMP_LEVEL_ID', value)}
            hasError={!!errors.EMP_LEVEL_ID}
            isLoading={loadingMasters}
            isDisabled={loadingMasters}
            width='100%'
          />
          {errors.EMP_LEVEL_ID && (
            <div className='invalid-feedback d-block'>
              {errors.EMP_LEVEL_ID}
            </div>
          )}
        </div>

        {/* ROW 3 - Position Count, Position Occupied */}

        <div className='col-lg-3 col-md-6 mb-3'>
          <SDLInput
            label='Position Count'
            type='text'
            value={formData.POSITION_COUNT}
            onChange={e => handleFieldChange('POSITION_COUNT', e.target.value)}
            error={errors.POSITION_COUNT}
            inputMode='numeric'
          />
        </div>

        <div className='col-lg-3 col-md-6 mb-3'>
          <SDLInput
            label='Position Occupied'
            type='text'
            value={formData.POSITION_OCCUPIED}
            onChange={e =>
              handleFieldChange('POSITION_OCCUPIED', e.target.value)
            }
            error={errors.POSITION_OCCUPIED}
            inputMode='numeric'
          />
        </div>
      </div>

      <div className='d-flex justify-content-end gap-2 mt-3'>
        <SaveButton
          onClick={() => handleSave(false)}
          disabled={saving}
          isSubmitting={saving}
          isEditing={isEditMode}
        >
          {isEditMode ? 'Update' : 'Save'}
        </SaveButton>

        {canSendForAuth && (
          <button
            type='button'
            className='btn btn-success'
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving
              ? isEditMode
                ? 'Updating...'
                : 'Sending...'
              : isEditMode
              ? 'Update & Send for Auth'
              : 'Save & Send for Auth'}
          </button>
        )}

        <CancelButton onClick={handleCancel} disabled={saving} />
      </div>
    </div>
  )
}

export default OrganogramTab
