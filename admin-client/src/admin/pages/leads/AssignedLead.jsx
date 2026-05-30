import { useState } from 'react';

import { leadsApi } from '../../../services/leads/leadsApi.js';

const AssignedLeadModal = ({ leadId }) => {

  const [assignedTo, setAssignedTo] = useState('');

  const handleAssign = async () => {

    try {

      await leadsApi.assignLead(
        leadId,
        assignedTo
      );

      alert('Lead Assigned');

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>

      <input
        type="text"
        placeholder="User ID"
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
      />

      <button onClick={handleAssign}>
        Assign
      </button>

    </div>
  );
};

export default AssignedLeadModal;