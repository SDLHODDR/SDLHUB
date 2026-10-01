import { useState } from "react";
import Swal from "sweetalert2";
import {
	createGroup,
} from "../services/telegramService";

const initialState = {
	group_name: "",
	description: "",
};

const CreateGroupModal = ({
	show,
	onClose,
	onSuccess,
}) => {

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

	const handleClose = () => {
		setFormData(initialState);
		setLoading(false);
		setErrors({});
		onClose();
	};

  // ======================================
  // HANDLE CHANGE
  // ======================================
  const handleChange = async (e) => {
    const { name, value } = e.target;
	setFormData((prev) => ({
	  ...prev,
	  [name]: value,
	}));
  };

  // ======================================
  // VALIDATION
  // ======================================

  const validate = () => {
	let newErrors = {};
	if (!formData.group_name.trim()) {
	  newErrors.group_name = "Group name required";
	}
	
	setErrors(newErrors);
	return Object.keys(newErrors).length === 0;
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async (e) => {
	e.preventDefault();
	if (!validate()) return;
	try {
	  setLoading(true);
	  console.log( "==============Create Group Payload========", formData );
	  const response = await createGroup(formData);
	  if (response?.success) {
	  	await Swal.fire({
			icon: "success",
			title: "Success",
			text: response?.message || `Group saved successfully.`,
		});
		onSuccess?.();
	  	 handleClose();
	  } else {
		Swal.fire({
			icon: "error",
			title: "Failed",
			text: response?.message || `Unable to save Group.`,
		});
	  }
	} catch (error) {
	  console.log(error);
	  Swal.fire({
		icon: "error",
		title: "Failed",
		text: error?.response?.data?.message || error?.message || "Unable to save Group.",
	});
	} finally {
	  setLoading(false);
	}
  };

  // ======================================
  // HIDE MODAL
  // ======================================

  if (!show) return null;
    return (
	  <>
	    <div className="modal fade show custom-modal d-block">
		  <div className="modal-dialog modal-dialog-centered modal-lg">
		    <div className="modal-content">
			  {/* HEADER */}
			  <div className="modal-header">
				<h5 className="modal-title"> Create Telegram Group </h5>
				<button
					type="button"
					className="btn-close custom-btn-close p-0"
					 onClick={handleClose}
					aria-label="Close"
				>
                <i className="ti ti-x" />
              </button>
			  </div>
			
			  {/* BODY */}
			  <form onSubmit={handleSubmit}>
				<div className="modal-body">
				  <div className="row">
					{/* GROUP NAME */}
					<div className="col-md-6 mb-3">
					  <label className="form-label"> Group Name </label>
					  <input  type="text" name="group_name" className="form-control" 
					  	placeholder="Enter Group Name" value={formData.group_name} 
						onChange={handleChange} />
					  {errors.group_name && (
						<div className="text-danger mt-1"> {errors.group_name} </div>
					  )}
					</div>

					{/* DIVISION */}
					{/* <div className="col-md-6 mb-3">
					  <label className="form-label"> Division </label>
					  <select name="DIVSN_ID" className="form-select" value={formData.DIVSN_ID}
					   onChange={handleChange} >
					    <option value=""> Please Select </option>
						{divisionList.map((div) => (
						  <option key={div.DIVSN_ID} value={div.DIVSN_ID} > {div.DIVSN_DESC} </option>
						))}
					  </select>
					  {errors.DIVSN_ID && (
						<div className="text-danger mt-1"> {errors.DIVSN_ID} </div>
					  )}
					</div> */}

					{/* HQ */}
					{/* <div className="col-md-6 mb-3">
					  <label className="form-label"> HQ </label>
					  <select name="HQ_ID" className="form-select" value={formData.HQ_ID}
					    onChange={handleChange} >
						<option value=""> Please Select </option>
						{hqList.map((hq) => (
						  <option key={hq.hq_id} value={hq.GEO_ID} > {hq.GEONM} </option>
						))}
					  </select>
						{errors.GEO_ID && (
						  <div className="text-danger mt-1"> {errors.GEO_ID} </div>
						)}
					</div> */}

					{/* DESCRIPTION */}
					<div className="col-md-12 mb-3">
					  <label className="form-label"> Description </label>
					  <textarea rows="3" name="description" className="form-control" 
					   placeholder="Enter Description" value={formData.description} 
					   onChange={handleChange} />
					</div>
				  </div>
				</div>
				{/* FOOTER */}
				<div className="modal-footer">
				  <button type="button" className="btn btn-secondary me-2" onClick={handleClose} > Cancel </button>
				  <button type="submit" className="btn btn-primary" disabled={loading} >
					{loading ? "Creating..." : "Create Group"}
				  </button>
				</div>
			  </form>
			</div>
		  </div>
		</div>
		{/* BACKDROP */}
		<div className="modal-backdrop fade show"></div>
	  </>
    );
};

export default CreateGroupModal;