import { useCallback, useEffect, useState } from "react";
import {
  getMasterTables,
  getMasterData,
  saveMasterData,
} from "../../services/masterDataService";
import BreadcrumbNav from "../../../eportal/components/breadcrumb-nav/BreadcrumbNav";
import { notifyError, notifySuccess } from "../../../../services/alertService";
import { getPortalFromPath } from "../../../../config/portalConfig";

import "../../assets/masterData.css";

const MasterData = () => {
  /* ==========================================================
     STATE
  ========================================================== */

  const [masterTables, setMasterTables] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);

  const [masterData, setMasterData] = useState([]);

  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  /* =========================
     EDIT
  ========================= */

  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");

  /* =========================
     ADD
  ========================= */

  const [isAdding, setIsAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  /* =========================
     SAVE
  ========================= */

  const [saving, setSaving] = useState(false);

  /* ==========================================================
     PORTAL
  ========================================================== */

  const portal = getPortalFromPath(location.pathname);

  const portalHome = `/${portal.key}/dashboard`;

  /* ==========================================================
     LOAD MASTER DATA
     
     Reusable function.
     
     IMPORTANT:
     We refresh data from DB after Add / Edit instead of
     manually inserting/updating React state.
  ========================================================== */

  const loadMasterData = useCallback(async (tabName) => {
    if (!tabName) {
      setMasterData([]);
      return;
    }

    try {
      setLoadingData(true);

      const res = await getMasterData(tabName);

      if (res?.status) {
        const records = res?.data?.records;

        setMasterData(Array.isArray(records) ? records : []);
      } else {
        setMasterData([]);

        notifyError(res?.message || "Unable to load master data.");
      }
    } catch (error) {
      console.error("Master data error:", error);

      setMasterData([]);

      notifyError(error?.message || "Unable to load master data.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  /* ==========================================================
     LOAD MASTER TABLES
  ========================================================== */

  useEffect(() => {
    const loadMasterTables = async () => {
      try {
        setLoadingTables(true);

        const res = await getMasterTables();

        if (res?.status) {
          const tables = res.data || [];

          setMasterTables(tables);

          /* ================================================
             SELECT FIRST MASTER BY DEFAULT
          ================================================ */

          if (tables.length > 0) {
            setSelectedMaster(tables[0]);
          }
        } else {
          notifyError(res?.message || "Unable to load master tables.");
        }
      } catch (error) {
        console.error("Master table error:", error);

        notifyError(error?.message || "Unable to load master tables.");
      } finally {
        setLoadingTables(false);
      }
    };

    loadMasterTables();
  }, []);

  /* ==========================================================
     LOAD DATA WHEN MASTER TABLE CHANGES
  ========================================================== */

  useEffect(() => {
    if (!selectedMaster?.tabName) {
      setMasterData([]);
      return;
    }

    /* ----------------------------------------------
       Reset Add / Edit state when changing master
    ---------------------------------------------- */

    setEditingId(null);
    setEditDescription("");

    setIsAdding(false);
    setNewDescription("");

    loadMasterData(selectedMaster.tabName);
  }, [selectedMaster, loadMasterData]);

  /* ==========================================================
     HANDLE MASTER TABLE CHANGE
  ========================================================== */

  const handleMasterChange = (master) => {
    if (saving || isAdding || editingId !== null) {
      return;
    }

    setSelectedMaster(master);
  };

  /* ==========================================================
     EDIT
  ========================================================== */

  const handleEdit = (row) => {
    if (saving || isAdding) {
      return;
    }

    setIsAdding(false);
    setNewDescription("");

    setEditingId(row.id);

    setEditDescription(row.description || "");
  };

  /* ==========================================================
     CANCEL EDIT
  ========================================================== */

  const handleCancelEdit = () => {
    if (saving) {
      return;
    }

    setEditingId(null);
    setEditDescription("");
  };

  /* ==========================================================
     SAVE EDIT
  ========================================================== */

  const handleSaveEdit = async (row) => {
    const description = editDescription.trim();

    /* ----------------------------------------------
       Validation
    ---------------------------------------------- */

    if (!description) {
      notifyError("Description is required.");
      return;
    }

    if (!selectedMaster?.tabName) {
      notifyError("Please select a master table.");
      return;
    }

    /* ----------------------------------------------
       Prevent duplicate submit
    ---------------------------------------------- */

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      const res = await saveMasterData({
        tabName: selectedMaster.tabName,
        id: row.id,
        description,
      });

      if (res?.status) {
        /* ==========================================
           CLOSE EDIT MODE
        ========================================== */

        setEditingId(null);
        setEditDescription("");

        /* ==========================================
           RELOAD FROM DATABASE

           Do NOT do:
           setMasterData(prev => ...)

           because the database is the source
           of truth.
        ========================================== */

        await loadMasterData(selectedMaster.tabName);

        notifySuccess(res.message || "Master record updated successfully.");
      } else {
        notifyError(res?.message || "Unable to update record.");
      }
    } catch (error) {
      console.error("Update master data error:", error);

      notifyError(error?.message || "Unable to update record.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     ADD
  ========================================================== */

  const handleAdd = () => {
    if (saving || editingId !== null) {
      return;
    }

    /* ----------------------------------------------
       Clear edit mode
    ---------------------------------------------- */

    setEditingId(null);
    setEditDescription("");

    /* ----------------------------------------------
       Open new row
    ---------------------------------------------- */

    setIsAdding(true);
    setNewDescription("");
  };

  /* ==========================================================
     CANCEL ADD
  ========================================================== */

  const handleCancelAdd = () => {
    if (saving) {
      return;
    }

    setIsAdding(false);
    setNewDescription("");
  };

  /* ==========================================================
     SAVE ADD
  ========================================================== */

  const handleSaveAdd = async () => {
    const description = newDescription.trim();

    /* ----------------------------------------------
       Validation
    ---------------------------------------------- */

    if (!description) {
      notifyError("Description is required.");
      return;
    }

    if (!selectedMaster?.tabName) {
      notifyError("Please select a master table.");
      return;
    }

    /* ----------------------------------------------
       Prevent double click / duplicate request
    ---------------------------------------------- */

    if (saving) {
      return;
    }

    try {
      setSaving(true);

      const res = await saveMasterData({
        tabName: selectedMaster.tabName,
        id: "",
        description,
      });

      if (res?.status) {
        /* ==========================================
           CLOSE ADD ROW
        ========================================== */

        setIsAdding(false);
        setNewDescription("");

        /* ==========================================
           RELOAD FROM DATABASE

           IMPORTANT:
           We do NOT manually push the new row
           into masterData.

           This prevents duplicate UI records.
        ========================================== */

        await loadMasterData(selectedMaster.tabName);

        notifySuccess(res.message || "Master record added successfully.");
      } else {
        /*
         * 409 duplicate response from PHP
         * will come here.
         */

        notifyError(res?.message || "Unable to add record.");
      }
    } catch (error) {
      console.error("Add master data error:", error);

      notifyError(error?.message || "Unable to add record.");
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     KEYBOARD HANDLER - ADD
  ========================================================== */

  const handleAddKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSaveAdd();
    }

    if (event.key === "Escape") {
      event.preventDefault();

      handleCancelAdd();
    }
  };

  /* ==========================================================
     KEYBOARD HANDLER - EDIT
  ========================================================== */

  const handleEditKeyDown = (event, row) => {
    if (event.key === "Enter") {
      event.preventDefault();

      handleSaveEdit(row);
    }

    if (event.key === "Escape") {
      event.preventDefault();

      handleCancelEdit();
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">
        <div className="page-title">
          <h4>Masters Master</h4>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "Masters Master",
            },
          ]}
        />
      </div>

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="card">
        <div className="card-body">
          {/* =================================================
              TITLE
          ================================================= */}

          <div className="text-center mb-3">
            <h6 className="fw-semibold">Select Master Table :</h6>
          </div>

          <div className="row">
            {/* =================================================
                LEFT MASTER TABLE LIST
            ================================================= */}

            <div className="col-lg-3">
              <div className="hrms-master-list">
                {loadingTables ? (
                  <div className="text-center py-3">
                    <div
                      className="spinner-border spinner-border-sm text-warning"
                      role="status"
                    />
                  </div>
                ) : masterTables.length === 0 ? (
                  <div className="text-muted text-center">
                    No master tables found.
                  </div>
                ) : (
                  masterTables.map((master) => {
                    const active = selectedMaster?.tabName === master.tabName;

                    return (
                      <button
                        key={master.tabName}
                        type="button"
                        className={`hrms-master-tab ${active ? "active" : ""}`}
                        onClick={() => handleMasterChange(master)}
                        disabled={saving || isAdding || editingId !== null}
                      >
                        {master.title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* =================================================
                RIGHT DATA TABLE
            ================================================= */}

            <div className="col-lg-9">
              <div className="table-responsive">
                <table
                  className="
                    table
                    table-bordered
                    table-hover
                    align-middle
                    mb-0
                    hrms-master-data-table
                  "
                >
                  {/* =================================================
                      TABLE HEADER
                  ================================================= */}

                  <thead>
                    <tr>
                      <th>Description</th>

                      <th
                        className="text-center"
                        style={{
                          width: "85px",
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-link p-0 hrms-add-btn"
                          title="Add"
                          onClick={handleAdd}
                          disabled={
                            isAdding ||
                            editingId !== null ||
                            saving ||
                            loadingData
                          }
                        >
                          <i className="ti ti-plus" />
                        </button>
                      </th>
                    </tr>
                  </thead>

                  {/* =================================================
                      TABLE BODY
                  ================================================= */}

                  <tbody>
                    {/* =================================================
                        ADD NEW ROW
                    ================================================= */}

                    {isAdding && (
                      <tr className="hrms-new-row">
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={newDescription}
                            onChange={(event) =>
                              setNewDescription(event.target.value)
                            }
                            onKeyDown={handleAddKeyDown}
                            placeholder="Enter description"
                            autoFocus
                            disabled={saving}
                          />
                        </td>

                        <td className="text-center">
                          {/* SAVE */}

                          <button
                            type="button"
                            className="btn btn-link p-0 hrms-save-btn me-2"
                            title="Save"
                            onClick={handleSaveAdd}
                            disabled={saving}
                          >
                            {saving ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              <i className="ti ti-check" />
                            )}
                          </button>

                          {/* CANCEL */}

                          <button
                            type="button"
                            className="btn btn-link p-0 hrms-cancel-btn"
                            title="Cancel"
                            onClick={handleCancelAdd}
                            disabled={saving}
                          >
                            <i className="ti ti-x" />
                          </button>
                        </td>
                      </tr>
                    )}

                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loadingData ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4">
                          <div
                            className="spinner-border spinner-border-sm text-warning"
                            role="status"
                          />

                          <span className="ms-2">Loading...</span>
                        </td>
                      </tr>
                    ) : masterData.length === 0 && !isAdding ? (
                      /* =================================================
                          NO RECORDS
                      ================================================= */

                      <tr>
                        <td colSpan="2" className="text-center text-muted py-4">
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      /* =================================================
                          EXISTING RECORDS
                      ================================================= */

                      masterData.map((row) => {
                        const isEditing = editingId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className={isEditing ? "hrms-editing-row" : ""}
                          >
                            {/* =========================================
                                DESCRIPTION
                            ========================================= */}

                            <td>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editDescription}
                                  onChange={(event) =>
                                    setEditDescription(event.target.value)
                                  }
                                  onKeyDown={(event) =>
                                    handleEditKeyDown(event, row)
                                  }
                                  autoFocus
                                  disabled={saving}
                                />
                              ) : (
                                row.description
                              )}
                            </td>

                            {/* =========================================
                                ACTIONS
                            ========================================= */}

                            <td className="text-center">
                              {isEditing ? (
                                <>
                                  {/* ============================
                                      SAVE
                                  ============================ */}

                                  <button
                                    type="button"
                                    className="btn btn-link p-0 hrms-save-btn me-2"
                                    title="Save"
                                    onClick={() => handleSaveEdit(row)}
                                    disabled={saving}
                                  >
                                    {saving ? (
                                      <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                      />
                                    ) : (
                                      <i className="ti ti-check" />
                                    )}
                                  </button>

                                  {/* ============================
                                      CANCEL
                                  ============================ */}

                                  <button
                                    type="button"
                                    className="btn btn-link p-0 hrms-cancel-btn"
                                    title="Cancel"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                  >
                                    <i className="ti ti-x" />
                                  </button>
                                </>
                              ) : (
                                /* ==============================
                                   EDIT
                                ============================== */

                                <button
                                  type="button"
                                  className="btn btn-link p-0 hrms-edit-btn"
                                  title="Edit"
                                  onClick={() => handleEdit(row)}
                                  disabled={
                                    isAdding || editingId !== null || saving
                                  }
                                >
                                  <i className="ti ti-pencil" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MasterData;
