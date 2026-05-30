const LeadTable = ({ leads }) => {

  return (
    <table className="w-full border">

      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Project</th>
        </tr>
      </thead>

      <tbody>

        {
          leads?.map((lead) => (
            <tr key={lead._id}>

              <td>{lead.name}</td>

              <td>{lead.phone}</td>

              <td>{lead.projectType}</td>

            </tr>
          ))
        }

      </tbody>

    </table>
  );
};

export default LeadTable;