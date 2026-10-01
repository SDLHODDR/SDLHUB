import React, { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";

const GroupFilters = ({
	search,
	setSearch,
	status,
	setStatus,
	onCreateSuccess,
	isFilter
}) => {
	const [showCreateModal, setShowCreateModal] = useState(false);

	return (
	<>
	  <div className="card border-0 shadow-sm mb-4">
		<div className="card-body">
		  <div className="row g-3 align-items-center">
			{/* SEARCH */}
			<div className="col-md-6">
			{isFilter && ( 
			  <input type="text" className="form-control" placeholder="Search Groups" value={search} onChange={(e) => setSearch(e.target.value)}/>
			)}
			</div>
			{/* STATUS */}
			<div className="col-md-3">
				{isFilter && (
				<select className="form-select" value={status}
					onChange={(e) => setStatus(e.target.value) }>
					<option value=""> All Status </option>
					<option value="Active"> Active </option>
					<option value="Inactive"> Inactive </option>
				</select>
				)}
			</div>
			{/* CREATE BUTTON */}
			<div className="col-md-3 text-end">
				<button className="btn btn-success" onClick={() => setShowCreateModal(true) } >
				<i className="ti ti-plus me-1"></i>Create Group
				</button>
			</div>
		  </div>
	    </div>
	  </div>
	  {/* CREATE MODAL */}
	  <CreateGroupModal
	    show={showCreateModal}
	    onClose={() =>  setShowCreateModal(false) }
	    onSuccess={onCreateSuccess}
	  />
	</>
	);
};

export default GroupFilters;