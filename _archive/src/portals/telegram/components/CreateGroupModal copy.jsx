import { useEffect, useState } from "react";
import { createGroup } from "../services/telegramService";

const initialState = {
	group_name: "",
	description: "",
	region: "",
	status: "Active",
	generate_qr: true,
};

const CreateGroupModal = ({
	show,
	onClose,
	onSuccess,
}) => {

	const [formData, setFormData] =  useState(initialState);
	const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

	// ======================================
	// RESET MODAL
	// ======================================
	useEffect(() => {
        if (!show) {
			setFormData(initialState);
			setLoading(false);
		}
	}, [show]);

	// ======================================
	// HANDLE CHANGE
	// ======================================

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

    const validate = () => {
        let newErrors = {};

        if (!formData.group_name.trim()) {
            newErrors.group_name =
            "Group name required";
        }

        if (!formData.region) {
            newErrors.region =
            "Region required";
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
            console.log("==============Create Group Payload========", formData);

			// ==================================
			// FUTURE NODE API
			// ==================================
            /*
			await createTelegramGroup(formData)
			*/
            await createGroup(formData);
            onSuccess?.();
            onClose();
            
		} catch (error) {
			console.log(error);
			//setLoading(false);
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
							<button type="button" className="btn-close" onClick={onClose} ></button>
						</div>
						{/* BODY */}
						<form onSubmit={handleSubmit}>
							<div className="modal-body">
								<div className="row">
									{/* GROUP NAME */}
									<div className="col-md-6 mb-3">
										<label className="form-label"> Group Name </label>

										<input
											type="text"
											name="group_name"
											className="form-control"
											placeholder="Enter Group Name"
											value={formData.group_name}
											onChange={handleChange}
											required
										/>
                                        {errors.group_name && (
                                            <div className="text-danger mt-1">
                                                {errors.group_name}
                                            </div>
                                        )}
									</div>
									{/* REGION */}
									<div className="col-md-6 mb-3">
										<label className="form-label"> Region </label>

										<select
											name="region"
											className="form-select"
											value={formData.region}
											onChange={handleChange}
										>

											<option value=""> Select Region </option>
											<option value="Mumbai"> Mumbai </option>
											<option value="Pune"> Pune </option>
											<option value="Nashik"> Nashik </option>
										</select>
									</div>
									{/* DESCRIPTION */}
									<div className="col-md-12 mb-3">
										<label className="form-label"> Description </label>
										<textarea
											rows="3"
											name="description"
											className="form-control"
											placeholder="Enter Description"
											value={formData.description}
											onChange={handleChange}
										/>
									</div>
									{/* STATUS */}
									<div className="col-md-6 mb-3">
										<label className="form-label"> Status </label>
										<select
											name="status"
											className="form-select"
											value={formData.status}
											onChange={handleChange}
										>
											<option value="Active"> Active </option>
											<option value="Inactive"> Inactive </option>
										</select>
									</div>
									{/* GENERATE QR */}
									<div className="col-md-6 mb-3 d-flex align-items-center">
										<div className="form-check mt-4">
											<input
												type="checkbox"
												name="generate_qr"
												className="form-check-input"
												checked={formData.generate_qr}
												onChange={handleChange}
											/>
								<label className="form-check-label">Generate QR Invite</label>
										</div>
									</div>
								</div>
							</div>
							{/* FOOTER */}
							<div className="modal-footer">
								<button type="button" className="btn btn-light" onClick={onClose}>
									Cancel
								</button>

								<button type="submit" className="btn btn-primary" disabled={loading}>
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