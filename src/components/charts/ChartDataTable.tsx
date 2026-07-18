import type {ReactNode} from 'react';

interface ChartDataTableProps {
    summary: string;
    caption: string;
    columns: string[];
    rows: ReactNode[][];
}

export default function ChartDataTable({summary, caption, columns, rows}: ChartDataTableProps) {
    return (
        <div className="sr-only">
            <p>{summary}</p>
            <table>
                <caption>{caption}</caption>
                <thead>
                    <tr>
                        {columns.map(column => <th key={column} scope="col">{column}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((value, columnIndex) => (
                                columnIndex === 0
                                    ? <th key={columnIndex} scope="row">{value}</th>
                                    : <td key={columnIndex}>{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
