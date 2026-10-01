import { useEffect, useMemo, useState } from "react";
import MemberTable from "../components/MemberTable";
import MemberFilters from "../components/MemberFilters";
import AddMemberModal from "../components/AddMemberModal";
import AssignGroupModal from "../components/AssignGroupModal";
import SendDirectMessageModal from "../components/SendDirectMessageModal";
import {
  getMembers,
  assignMemberToGroups,
  saveMemberDM
} from "../services/telegramMemberService";

const SDLTelegramMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  //const [showImportModal, setShowImportModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await getMembers();
      const formattedMembers = (res.data || []).map((item) => ({
        id: item.ID,
        name: `${item.FIRST_NAME} ${item.LAST_NAME}`,
        mobile: item.MOBILE_NUMBER,
        employeeCode: item.EMPLOYEE_CODE,
        username: "",

        joinedAt: item.CREATED_ON,
        TelegramjoinedAt: item.JOINED_ON,

        ACTIVE_FLAG: item.ACTIVE_FLAG,
        TELEGRAM_JOINED: item.TELEGRAM_JOINED,

        GROUP_COUNT: Number(item.GROUP_COUNT || 0),
        GROUP_NAMES: item.GROUP_NAMES || "",
      }));
      setMembers(formattedMembers);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMembers()
      .then((response) => {
        if (!isMounted) return;
        const formattedMembers = (response.data || []).map((item) => ({
          id: item.ID,
          name: `${item.FIRST_NAME} ${item.LAST_NAME}`,
          mobile: item.MOBILE_NUMBER,
          employeeCode: item.EMPLOYEE_CODE,
          username: "",
          joinedAt: item.CREATED_ON,
          TelegramjoinedAt: item.JOINED_ON,
          ACTIVE_FLAG: item.ACTIVE_FLAG,
          TELEGRAM_JOINED: item.TELEGRAM_JOINED,
          GROUP_COUNT: Number(item.GROUP_COUNT || 0),
          GROUP_NAMES: item.GROUP_NAMES || "",
        }));
        setMembers(formattedMembers);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredMembers = useMemo(() => {
    let data = members;
    if (search) {
      data = data.filter(
        (item) =>
          (item.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (item.mobile || "").includes(search)
      );
    }
    if (selectedGroup) {
      data = data.filter((item) =>
        (item.GROUP_NAMES || "")
          .split(/\r?\n/)
          .some((groupName) => groupName.replace(/\s+\([^)]*\)$/, "") === selectedGroup),
      );
    }
    return data;
  }, [members, search, selectedGroup]);

  const handleAddMember = async () => {
    try {
      await loadMembers();
    } catch (error) {
      console.log(error);
    }
  };

  const handleAssignGroups = () => {
    if (!selectedMemberIds.length) {
      alert("Please select at least one member to assign groups.");
      return;
    }
    setShowAssignModal(true);
  };

  const handleSaveGroups = async (memberData, groupIds) => {
    try {
      const response = await assignMemberToGroups({
        member_data: memberData,
        group_ids: groupIds,
      });

      console.log("ASSIGN GROUP RESPONSE", response);

      alert("Groups assigned successfully");

      setShowAssignModal(false);
      await loadMembers();
      clearSelection(); // <-- Add this
    } catch (error) {
      console.error("Failed to assign groups", error);
      alert("Failed to assign groups");
    }
  };

  const handleToggleMemberSelection = (memberId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSelectAllMembers = (pageMembers) => {
    const pageIds = pageMembers.map((member) => member.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedMemberIds.includes(id));

    setSelectedMemberIds((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])]
    );
  };

  const selectedMembers = members.filter((member) => selectedMemberIds.includes(member.id) );

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const [showDMModal, setShowDMModal] = useState(false);

  const handleSendDM = () => {
    if (!selectedMemberIds.length) { alert( "Please select at least one member." );
      return;
    }

    setShowDMModal(true);
  };

  const handleSaveDM = async (message, memberFormData) => {
    try {
      const response = await saveMemberDM({
        member_data: memberFormData,
        message,
      });

      console.log(response);

      alert("Message queued successfully");

      setShowDMModal(false);
      clearSelection(); // <-- Add this
    } catch (error) {
      console.error(error);
      alert("Failed to queue message");
    }
  };

  const clearSelection = () => {
    setSelectedMemberIds([]);
  };

  return (
    <div className="telegram-page p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1 fw-bold"> Members Management </h4>
          <p className="text-muted mb-0"> Manage telegram group members </p>
        </div>
        <div className="d-flex gap-2">
          {/* <button className="btn btn-outline-primary" onClick={() => setShowImportModal(true)} >
            Import CSV
          </button> */}
          <button
            className="btn btn-info"
            onClick={handleSendDM}
            disabled={!selectedMemberIds.length}
          >
            Send DM
          </button>
          <button className="btn btn-secondary" onClick={handleAssignGroups} disabled={!selectedMemberIds.length}>
            Assign Groups
          </button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)} >
            Add Member
          </button>
        </div>
      </div>
      <div className="telegram-card card border-0 shadow-sm p-3">
        <MemberFilters
          search={search}
          setSearch={(value) => {
            setSearch(value);
            setCurrentPage(1);
          }}
          selectedGroup={selectedGroup}
          setSelectedGroup={(value) => {
            setSelectedGroup(value);
            setCurrentPage(1);
          }}
        />

        {loading ? (
          <div className="text-center py-4" role="status">
            <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
            Loading members...
          </div>
        ) : (
          <MemberTable
            members={paginatedMembers}
            selectedIds={selectedMemberIds}
            onSelect={handleToggleMemberSelection}
            onSelectAll={() => handleSelectAllMembers(paginatedMembers)}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            total={filteredMembers.length}
            pageSize={pageSize}
          />
        )}
      </div>
      <AddMemberModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMember}
      />
      <AssignGroupModal
        show={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          clearSelection();
        }}
        members={selectedMembers}
        onSave={handleSaveGroups}
      />

     <SendDirectMessageModal
        show={showDMModal}
        onClose={() => {
          setShowDMModal(false);
          clearSelection();
        }}
        members={selectedMembers}
        onSave={handleSaveDM}
      />
        
      {/* <QRInviteModal
        show={showQRModal}
        onClose={() => setShowQRModal(false)}
        member={selectedMember}
      />*/}

    </div>
  );
};

export default SDLTelegramMembers;