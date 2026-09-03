const JDDataTable = ({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  showEdit = false,
  showDelete = false,
  emptyMessage = 'No data found'
}) => {
  return (
    <div
      style={{
        width: '100%',
        overflowX: 'hidden',
        marginTop: '20px'
      }}
    >
      <table
        className='table table-bordered table-hover'
        style={{
          width: '100%',
          tableLayout: 'fixed',
          marginBottom: 0,
          fontSize: '13px'
        }}
      >
        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                style={{
                  width: column.width || 'auto',
                  textAlign: column.align || 'left',
                  verticalAlign: 'middle'
                }}
              >
                {column.label}
              </th>
            ))}

            {showEdit && (
              <th
                style={{
                  width: '70px',
                  textAlign: 'center'
                }}
              >
                Edit
              </th>
            )}

            {showDelete && (
              <th
                style={{
                  width: '80px',
                  textAlign: 'center'
                }}
              >
                Delete
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={item.ID ?? item.id ?? index}>
                {columns.map(column => (
                  <td
                    key={column.key}
                    style={{
                      textAlign: column.align || 'left',
                      verticalAlign: 'middle',
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word'
                    }}
                  >
                    {column.render
                      ? column.render(item, index)
                      : item[column.key] ?? '-'}
                  </td>
                ))}

                {showEdit && (
                  <td
                    style={{
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}
                  >
                    <button
                      type='button'
                      className='btn btn-warning btn-sm'
                      onClick={() => onEdit?.(item)}
                    >
                      Edit
                    </button>
                  </td>
                )}

                {showDelete && (
                  <td
                    style={{
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}
                  >
                    <button
                      type='button'
                      className='btn btn-danger btn-sm'
                      onClick={() => onDelete?.(item)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length +
                  (showEdit ? 1 : 0) +
                  (showDelete ? 1 : 0)
                }
                style={{
                  textAlign: 'center',
                  padding: '12px'
                }}
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

                        {/* INDUCTION TABLE - Responsive */}
                        // <div className='table-responsive mt-4'>
                        //   <table className='table table-bordered table-hover'>
                        //     <thead>
                        //       <tr>
                        //         <th>Induction</th>
                        //         <th>Organogram</th>
                        //         <th>Sequence</th>
                        //         <th>Delete</th>
                        //       </tr>
                        //     </thead>

                        //     <tbody>
                        //       {inductionDataList.length > 0 ? (
                        //         inductionDataList.map((item, index) => (
                        //           <tr key={item.ID ?? index}>
                        //             <td>
                        //               {item.INDUC_DESC ||
                        //                 inductionOptions.find(
                        //                   option =>
                        //                     String(option.value) ===
                        //                     String(item.INDUC_ID)
                        //                 )?.label ||
                        //                 '-'}
                        //             </td>

                        //             <td>
                        //               {item.ORG_LABEL ||
                        //                 organogramOptions.find(
                        //                   option =>
                        //                     String(option.value) ===
                        //                     String(item.ORG_ID)
                        //                 )?.label ||
                        //                 '-'}
                        //             </td>

                        //             <td>{item.DISP_SEQ || '-'}</td>

                        //             <td>
                        //               <button
                        //                 type='button'
                        //                 className='btn btn-sm btn-danger'
                        //                 onClick={() => {
                        //                 }}
                        //               >
                        //                 Delete
                        //               </button>
                        //             </td>
                        //           </tr>
                        //         ))
                        //       ) : (
                        //         <tr>
                        //           <td colSpan='4' className='text-center'>
                        //             No data found
                        //           </td>
                        //         </tr>
                        //       )}
                        //     </tbody>
                        //   </table>
                        // </div>

export default JDDataTable