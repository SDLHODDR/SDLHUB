import React from "react";

const Dashboard = () => {
  return (
    <div className="container-fluid">

      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="row align-items-center">

          <div className="col">
            <h3 className="page-title mb-1">
              HRMS Dashboard
            </h3>

            <p className="text-muted mb-0">
              Welcome to the Human Resource Management System
            </p>
          </div>

        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="row">

        {/* Employees */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <p className="text-muted mb-1">
                    Total Employees
                  </p>

                  <h3 className="mb-0">
                    1250
                  </h3>
                </div>

                <div className="avatar avatar-lg bg-primary">
                  <i className="ti ti-users fs-24"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Present */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <p className="text-muted mb-1">
                    Present Today
                  </p>

                  <h3 className="mb-0">
                    1085
                  </h3>
                </div>

                <div className="avatar avatar-lg bg-success">
                  <i className="ti ti-user-check fs-24"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* On Leave */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <p className="text-muted mb-1">
                    On Leave
                  </p>

                  <h3 className="mb-0">
                    42
                  </h3>
                </div>

                <div className="avatar avatar-lg bg-warning">
                  <i className="ti ti-calendar-off fs-24"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* New Joiners */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card">
            <div className="card-body">

              <div className="d-flex align-items-center justify-content-between">

                <div>
                  <p className="text-muted mb-1">
                    New Joiners
                  </p>

                  <h3 className="mb-0">
                    18
                  </h3>
                </div>

                <div className="avatar avatar-lg bg-info">
                  <i className="ti ti-user-plus fs-24"></i>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Welcome Card */}
      <div className="row">

        <div className="col-12">

          <div className="card">

            <div className="card-body">

              <h4 className="mb-2">
                Welcome to HRMS
              </h4>

              <p className="text-muted mb-0">
                This is the HRMS dashboard. The dashboard
                widgets and employee-related information
                will be integrated here later.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;