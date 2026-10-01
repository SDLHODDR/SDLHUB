import { useState, useEffect, useContext } from "react";
import { getMockGroups } from "../services/mockData";
import {
  getPSRDataDetails,
  getPSRGRPDataDetails,
  getHRMSMembers,
  addMember
} from "../services/telegramMemberService";
import {
	getCompanies,
  getDivisions,
	getDepartments,
} from "../services/telegramService";
import AuthContext from "../../../auth/AuthContext";
import Swal from "sweetalert2";

const AddMemberModal = ({ show, onClose, onSave }) => {
  const initialState = {
    name: "",
    mobile: "",
    username: "",
    employeeCode: "",
    headquarters: "",
    memberIds: [],
  };

  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [psrData, setPSRData] = useState([]);
  const [psrGrpData, setPSRGRPData] = useState([]);
  const [companyList, setCompanyList] = useState([]);
  const [divisionList, setDivisionList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [memberList, setMemberList] = useState([]);

  // ======================================
  // RESET MODAL
  // ======================================
  useEffect(() => {
    if (!show) {
      setFormData(initialState);
      setLoading(false);
      //setErrors({});
    }
  }, [show]);

  const handleGroupChange = (empCode, empPhone, empName) => {
    const exists = formData.memberIds.some(
      (m) => m.empCode === empCode
    );

    let updatedMembers = [];

    if (exists) {
      updatedMembers = formData.memberIds.filter(
        (m) => m.empCode !== empCode
      );
    } else {
      updatedMembers = [
        ...formData.memberIds,
        {
          empCode,
          empPhone,
          empName,
        },
      ];
    }

    setFormData({
      ...formData,
      memberIds: updatedMembers,
    });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allMembers = memberList.map((member) => ({
        empCode: member.EMP_CODE,
        empPhone: member.CELL,
        empName: `${member.FNAME} ${member.LNAME}`,
      }));

      setFormData((prev) => ({
        ...prev,
        memberIds: allMembers,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        memberIds: [],
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        company_id: formData.COMP_ID,
        division_id: formData.DIVSN_ID,
        department_id: formData.DEPT_ID,
        members: formData.memberIds,
      };

      console.log("SUBMIT PAYLOAD", payload);

      const response = await addMember(payload);
      if (response?.success) {
        await Swal.fire({
          icon: "success",
          title: "Success",
          text: response?.message || `Members saved successfully.`,
        });
        onSave(payload);
        setFormData(initialState);
        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: response?.message || `Unable to save Members.`,
        });
      } 
    } catch (error) {
      console.log(error);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to save members.",
      });
    } finally {
      setLoading(false);
    }
  };

  const showEmp = (e) => {
    const { name, value } = e.target;
  };

  // ======================================
  // LOAD DIVISIONS
  // ======================================
  useEffect(() => {
    loadDivisions();
    loadCompanies();
    loadDepartments();
  }, []);

  const loadCompanies = async () => {
    try {
	    const res = await getCompanies();
	    setCompanyList(res.data || []);
	  } catch (error) {
	    console.log("Companies Load Error", error);
	  }
  };

  const loadDivisions = async () => {
    try {
	    const res = await getDivisions();
	    setDivisionList(res.data || []);
	  } catch (error) {
	    console.log("Division Load Error", error);
	  }
  };

  const loadDepartments = async () => {
    try {
	    const res = await getDepartments();
	    setDepartmentList(res.data || []);
	  } catch (error) {
	    console.log("Department Load Error", error);
	  }
  };

  // ======================================
  // HANDLE CHANGE
  // ======================================
  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = {
      ...formData,
      [name]: value,
    };

    console.log("=========Department==========", name, value, updatedForm.DEPT_ID);
    // Department CHANGE
    if (name === "DEPT_ID") {
      if (value && updatedForm.DEPT_ID) {
        loadMemberList(
          updatedForm.DEPT_ID,
          updatedForm.COMP_ID,
          updatedForm.DIVSN_ID,
          value
        );
      } else {
        setMemberList([]);
      }
    }
    setFormData(updatedForm);
  };

const loadMemberList = async (dept_id, comp_id, divsn_id) => {
  try {
    setLoading(true);

    const response = await getHRMSMembers({
      dept_id,
      comp_id,
      divsn_id,
    });

    console.log("RAW RESPONSE", response.data);

    setMemberList(response.data || []);
  } catch (error) {
    console.log("Member Load Error", error);
    setMemberList([]);
  } finally {
    setLoading(false);
  }
};

console.log("===========Member list===========", memberList);

console.log("memberList", memberList);
console.log("Array?", Array.isArray(memberList));

  if (!show) return null;

  return (
    <div className="modal d-block telegram-modal">
      <div className="modal-dialog modal-lg modal-dialog-centered" style={{ maxWidth: "1200px" }}>
        <div className="modal-content telegram-card border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title"> Add Member </h5>
            <button type="button" className="btn-close custom-btn-close p-0" onClick={onClose} aria-label="Close"> <i className="ti ti-x" /> </button>
          </div>
          
          <div className="modal-body">
            <div className="row g-3">
              {/* Row 1 */}
              <div className="col-md-4">
                <label className="form-label">Company</label>
                <select name="COMP_ID" className="form-select" value={formData.COMP_ID} onChange={handleChange} >
                  <option value="">Please Select</option>
                  {companyList.map((comp) => (
                  <option key={comp.COMP_ID} value={comp.COMP_ID}> {comp.COMP_DESC} </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Division</label>
                <select name="DIVSN_ID" className="form-select" value={formData.DIVSN_ID} 
                  onChange={handleChange} >
                  <option value="">Please Select</option>
                  {divisionList.map((dvn) => (
                  <option key={dvn.DIVSN_ID} value={dvn.DIVSN_ID}> {dvn.DIVSN_DESC} </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Department</label>
                <select name="DEPT_ID" className="form-select" value={formData.DEPT_ID} 
                onChange={handleChange} >
                  <option value="">Please Select</option>
                  {departmentList.map((dept) => (
                    <option key={dept.DEPT_ID} value={dept.DEPT_ID}> {dept.DEPT_DESC} </option>
                  ))}
                </select>
              </div>
              {/* Row 2 */}
              <div className="col-12">
                <label className="form-label">Members</label>

                <div className="table-responsive">
                  <table className="table table-bordered table-hover table-sm">
                    <thead>
                      <tr>
                        <th width="50">
                          <input
                            type="checkbox"
                            checked={
                              memberList.length > 0 &&
                              formData.memberIds.length === memberList.length
                            }
                            onChange={(e) =>
                              handleSelectAll(e.target.checked)
                            }
                          />
                        </th>
                        <th>Emp Code</th>
                        <th>Name</th>
                        <th>Division</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Designation</th>
                      </tr>
                    </thead>

                    <tbody>
                    {memberList.length > 0 ? (
                      memberList.map((member) => (
                        <tr key={member.EMP_CODE}>
                          <td>
                            <input
                              type="checkbox"
                              checked={formData.memberIds.some(
                                (m) => m.empCode === member.EMP_CODE
                              )}
                              onChange={() =>
                                handleGroupChange(
                                  member.EMP_CODE,
                                  "",
                                  `${member.FNAME} ${member.LNAME}`
                                )
                              }
                            />
                          </td>

                          <td>{member.EMP_CODE}</td>
                          <td>{member.FNAME} {member.LNAME}</td>
                          <td>{member.DIVSN_DESC}</td>
                          <td>{member.DEPT_DESC}</td>
                          <td>{member.STATUS}</td>
                          <td>{member.DESI_DESC}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No members found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary me-2" onClick={onClose} > Cancel </button>
				    <button type="button" className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
              {loading ? "Saving..." : "Save Member"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;