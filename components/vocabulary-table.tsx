'use client';

import { useState } from 'react';

interface VocabularyTableProps {
  content: string;
}

export function VocabularyTable({ content }: VocabularyTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Extract table data from markdown
  const lines = content.split('\n');
  const tableStart = lines.findIndex(line => line.includes('|') && line.includes('Word'));
  const tableEnd = lines.findIndex((line, index) => 
    index > tableStart && line.includes('|') && line.includes('---')
  );
  
  if (tableStart === -1) {
    return <div className="text-sm">{content}</div>;
  }
  
  const tableLines = lines.slice(tableStart, tableEnd + 1);
  const headerLine = tableLines[0];
  const separatorLine = tableLines[1];
  const dataLines = tableLines.slice(2);
  
  const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
  const rows = dataLines.map(line => 
    line.split('|').map(cell => cell.trim()).filter(cell => cell)
  ).filter(row => row.length > 0);
  
  return (
    <div className="my-4">
      <div className="bg-background/50 border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b">
          <h3 className="font-semibold text-primary">Vocabulary Table</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                {headers.map((header, index) => (
                  <th key={index} className="px-3 py-2 text-left text-xs font-semibold text-primary border-r last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, isExpanded ? rows.length : 3).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-b-0 hover:bg-muted/20">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-2 text-xs border-r last:border-r-0">
                      <div className="whitespace-pre-wrap">
                        {cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').split('\n').map((line, lineIndex) => (
                          <div key={lineIndex} dangerouslySetInnerHTML={{ __html: line }} />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > 3 && (
          <div className="px-4 py-2 bg-muted/30 border-t">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline"
            >
              {isExpanded ? 'Show Less' : `Show All ${rows.length} Words`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
