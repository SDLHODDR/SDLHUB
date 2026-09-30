import React, { useState } from "react";
//import ViewGroupModal from "./ViewGroupModal";

const GroupCard = ({ group }) => {
  const QRCODEPATH = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=";
  const QRCODEIMG = QRCODEPATH + encodeURIComponent(group.INVITE_LINK);
  //const [selectedGroup, setSelectedGroup] =  useState(null);
  
  return (
  <>
    <div className="telegram-group-card card border-0 shadow-sm">
      <div className="card-body">
        {/* TOP */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="pe-3">
            <h5 className="telegram-group-title mb-2"> {group.TITLE} </h5>
            <span className={`badge ${ group.STATUS === 1 ? "bg-success" : "bg-dark" }`} >
              {group.STATUS}
            </span>
          </div>
          <div className="telegram-qr-wrapper"> 
            <img src={QRCODEIMG} alt="QR" className="telegram-card-qr" /> 
          </div>
        </div>
        {/* DETAILS */}
        <div className="telegram-card-details">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted"> Status : </span>
            <strong>  {group.ACTIVE_FLAG === "1" ? "Active" : "Inactive"} </strong>
          </div>
          <div className="d-flex justify-content-between mb-3">
            <span className="text-muted"> Created On : </span>
            <strong> {group.CREATED_ON} </strong>
          </div>
        </div>
        {/* BUTTONS */}
      </div>
    </div>
  </>
  );
};

export default GroupCard;