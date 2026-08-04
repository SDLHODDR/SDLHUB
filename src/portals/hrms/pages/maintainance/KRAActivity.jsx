import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import BreadcrumbNav from "../../components/breadcrumb-nav/BreadcrumbNav";
import { getPortalFromPath } from "../../../../config/portalConfig";

import SDLSearch from "../../../../components/datatable/SDLSearch";
import SDLDataTable from "../../../../components/datatable/SDLDataTable";

const KRAActivity = () => {
  const location = useLocation();
  const portal = getPortalFromPath(location.pathname);
  const portalHome = `/${portal.key}/dashboard`;

  const [showAll, setShowAll] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    kraMaster: "",
    activityTitle: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [kraActivities] = useState([
    {
      id: 1,
      title: "KRA Review Setup",
      kraMaster: "Performance Master",
      activityTitle: "KRA Review Setup",
    },
    {
      id: 2,
      title: "Declaration Submission",
      kraMaster: "Compliance Master",
      activityTitle: "Declaration Submission",
    },
    {
      id: 3,
      title: "Employee Capability Mapping",
      kraMaster: "Capability Master",
      activityTitle: "Employee Capability Mapping",
    },
  ]);

  const currentActivity =
    kraActivities.find((item) => item.title === selectedActivity) || null;

  const resetForm = () => {
    setIsEditing(false);
    setSelectedActivity("");
    setFormData({
      id: "",
      kraMaster: "",
      activityTitle: "",
    });
  };

  const handleSelectActivity = (value) => {
    setSelectedActivity(value);

    if (!value) {
      resetForm();
      return;
    }

    const activity = kraActivities.find((item) => item.title === value);

    if (activity) {
      setIsEditing(true);
      setFormData({
        id: activity.id,
        kraMaster: activity.kraMaster,
        activityTitle: activity.activityTitle,
      });
    }
  };

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity.title);
    setIsEditing(true);
    setShowAll(false);
    setFormData({
      id: activity.id,
      kraMaster: activity.kraMaster,
      activityTitle: activity.activityTitle,
    });
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return kraActivities;

    return kraActivities.filter((item) =>
      [item.title, item.kraMaster, item.activityTitle]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery, kraActivities]);

  const serialBody = (rowData, options) =>
    options.rowIndex + 1 + (options.props.first || 0);

  const titleBody = (row) => <>{row.title}</>;

  const columns = [
    {
      header: "#",
      body: serialBody,
      style: {
        width: "70px",
        textAlign: "center",
      },
    },
    {
      field: "kraMaster",
      header: "KRA Master",
      sortable: true,
      style: {
        width: "220px",
      },
    },
    {
      field: "title",
      header: "KRA Activity",
      body: titleBody,
      sortable: true,
      style: {
        minWidth: "240px",
      },
    },
    
    
    {
      header: "Edit",
      body: (row) => (
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => handleEditActivity(row)}
        >
          Edit
        </button>
      ),
      style: {
        width: "100px",
        textAlign: "center",
      },
    },
    {
      header: "Delete",
      body: () => <button className="btn btn-sm btn-outline-danger">Delete</button>,
      style: {
        width: "100px",
        textAlign: "center",
      },
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="add-item d-flex">
          <div className="page-title">
            <h4>KRA Activity</h4>
          </div>
        </div>

        <BreadcrumbNav
          items={[
            {
              text: "Home",
              link: portalHome,
            },
            {
              text: "KRA Activity",
            },
          ]}
        />
      </div>

      <div className="row">
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-end align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2" style={{ minWidth: "220px" }}>
                
                <select
                  className="form-select"
                  value={selectedActivity}
                  onChange={(e) => handleSelectActivity(e.target.value)}
                  style={{ minWidth: "220px" }}
                >
                  <option value="">Select KRA Activity</option>
                  {kraActivities.map((item) => (
                    <option key={item.id} value={item.title}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                onClick={() => setShowAll((prev) => !prev)}
              >
                <i className="fas fa-table"></i>
                {showAll ? "Hide Table" : "View Table"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {!showAll ? (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3">
                  {isEditing ? "Edit KRA Activity" : "Add KRA Activity"}
                </h5>

                <div className="row">
                  <div className="col-lg-4 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">KRA Master</label>
                      <select
                        className="form-select"
                        value={formData.kraMaster}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            kraMaster: e.target.value,
                          }))
                        }
                      >
                        <option value="">Select KRA Master</option>
                        <option value="Performance Master">Performance Master</option>
                        <option value="Compliance Master">Compliance Master</option>
                        <option value="Capability Master">Capability Master</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-lg-4 col-md-6">
                    <div className="mb-3">
                      <label className="form-label">KRA Activity</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.activityTitle}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            activityTitle: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="text-end mb-3">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEditing ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-xl-12">
            <div className="card">
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-lg-4 col-md-6 col-12">
                    <SDLSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search KRA..."
                    />
                  </div>
                </div>

                {filteredData.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    No data found
                  </div>
                ) : (
                  <div className="table-responsive">
                    <SDLDataTable
                      data={filteredData}
                      columns={columns}
                      loading={false}
                      emptyMessage="No data found"
                      className="holiday-calendar-grid"
                      removableSort
                      tableStyle={{ minWidth: "650px" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KRAActivity;
