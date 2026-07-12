function Table({ columns = [], data = [], emptyMessage = 'No data available.' }) {
  if (!data.length) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="sticky top-0 bg-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={[
                  'border-b border-neutral-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500',
                  column.align === 'right' ? 'text-right' : 'text-left',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {data.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex} className="hover:bg-neutral-50">
              {columns.map((column) => {
                const cellValue = row[column.key];
                const content = column.render
                  ? column.render(cellValue, row)
                  : cellValue;

                return (
                  <td
                    key={column.key}
                    className={[
                      'whitespace-nowrap px-4 py-3 text-sm text-neutral-700',
                      column.align === 'right' ? 'text-right' : 'text-left',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
