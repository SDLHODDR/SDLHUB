import { useEffect, useState } from "react";

import MemberTable from "../components/MemberTable";
import MemberFilters from "../components/MemberFilters";
import AddMemberModal from "../components/AddMemberModal";
import AssignGroupModal from "../components/AssignGroupModal";
import QRInviteModal from "../components/QRInviteModal";
import ImportMembersModal from "../components/ImportMembersModal";

import {
  getMembers,
  addMember,
  assignMemberToGroups
} from "../services/telegramMemberService";

const SDLTelegramMembers = () => {
  const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadMembers = async () => {
  try {
    setLoading(true);

    const res = await getMembers();

    console.log("===========Members rrrrr===========", res);

    const formattedMembers = (res.data || []).map(
      (item) => ({
        id: item.ID,
        name: `${item.FIRST_NAME} ${item.LAST_NAME}`,
        mobile: item.MOBILE_NUMBER,
        employeeCode: item.EMPLOYEE_CODE,
        username: "",
        groupIds: [],
        inviteStatus: "Pending",
        division_id: item.DIVSN_ID,
        hq_id: item.HQ_ID,
        joinedAt: item.CREATED_ON,
      })
    );

    setMembers(formattedMembers);
    setFilteredMembers(formattedMembers);

  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    let data = [...members];

    if (search) {
      data = data.filter(
        (item) =>
          item.name
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.mobile.includes(search)
      );
    }

    if (selectedGroup) {
      data = data.filter((item) =>
        item.groupIds.includes(Number(selectedGroup))
      );
    }

    setFilteredMembers(data);
  }, [search, selectedGroup, members]);

  const handleAddMember = async (payload) => {
    try {
      setLoading(true);
      //console.log("========Members==========", payload);
      const res = await addMember(payload);

      if (res?.success) {
        
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignGroups = (member) => {
    console.log("================Member=============", member);
    setSelectedMember(member);
    setShowAssignModal(true);
  };

  const handleOpenQR = (member) => {
    setSelectedMember(member);
    setShowQRModal(true);
  };

  const handleSaveGroups = async (
    memberData,
    groupIds
  ) => {
    try {
      console.log( "==========Member Id ============", memberData );
      console.log("==========Group Id ============", groupIds );

      const response = await assignMemberToGroups({
        member_data: memberData, group_ids: groupIds,
      });

      console.log( "ASSIGN GROUP RESPONSE", response );
      alert("Groups assigned successfully");
    } catch (error) {
      console.error(
        "Failed to assign groups",
        error
      );

      alert("Failed to assign groups");
    }
  };

  const handleImportMembers = (rows) => {
    console.log(rows);
  };

  return (
    <div className="telegram-page p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1 fw-bold">
            Members Management
          </h4>

          <p className="text-muted mb-0">
            Manage telegram group members
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => setShowImportModal(true)}
          >
            Import CSV
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Member
          </button>
        </div>
      </div>

      <div className="telegram-card card border-0 shadow-sm p-3">
        <MemberFilters
          search={search}
          setSearch={setSearch}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
        />

        <MemberTable
          members={filteredMembers}
          onAssign={handleAssignGroups}
          onQR={handleOpenQR}
        />
      </div>

      <AddMemberModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMember}
      />

      <AssignGroupModal
      show={showAssignModal}
      onClose={() => setShowAssignModal(false)}
      member={selectedMember}
      onSave={handleSaveGroups}
    />

    <QRInviteModal
      show={showQRModal}
      onClose={() => setShowQRModal(false)}
      member={selectedMember}
    />

    <ImportMembersModal
      show={showImportModal}
      onClose={() => setShowImportModal(false)}
      onImport={handleImportMembers}
    />
    </div>
  );
};

export default SDLTelegramMembers;