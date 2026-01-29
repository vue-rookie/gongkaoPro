import React from 'react';

// --- Types ---
export type ShapeType = 'circle' | 'rect' | 'triangle' | 'star' | 'line' | 'dot_matrix' | 'text';
export type FillType = 'black' | 'white' | 'none' | 'striped';

export interface GraphicElement {
  type: ShapeType;
  // Position & Size (0-100 scale)
  x?: number; 
  y?: number;
  w?: number; // width or size
  h?: number; // height
  // Style
  fill?: FillType;
  stroke?: boolean;
  strokeWidth?: number;
  rotation?: number;
  // Specific for dot_matrix
  matrixRows?: number;
  matrixCols?: number;
  matrixData?: number[]; // Flat array: 1=black, 0=white, 2=hidden/empty
  // Specific for lines
  x2?: number;
  y2?: number;
  // Specific for text
  text?: string;
  fontSize?: number;
}

export interface GraphicCell {
  elements: GraphicElement[];
  bgColor?: string;
  showBorder?: boolean;
}

export interface QuestionStemGraphic {
  layout: 'matrix_3x3' | 'sequence_4' | 'sequence_5' | 'analogy';
  cells: GraphicCell[];
}

// --- Renderers ---

const RenderShape: React.FC<{ el: GraphicElement }> = ({ el }) => {
  const { type, x = 50, y = 50, w = 20, h = 20, fill = 'none', stroke = true, rotation = 0 } = el;
  
  const commonStyle = {
    fill: fill === 'black' ? '#000' : fill === 'white' ? '#fff' : 'none',
    stroke: (stroke || fill === 'white' || fill === 'none') ? '#000' : 'none',
    strokeWidth: el.strokeWidth || 2,
    transformOrigin: `${x}% ${y}%`,
    transform: `rotate(${rotation}deg)`
  };

  // Normalize type
  const normalizedType = type?.toLowerCase();

  switch (normalizedType) {
    case 'circle':
      return <circle cx={`${x}%`} cy={`${y}%`} r={`${w/2}%`} style={commonStyle} />;
    
    case 'rect':
    case 'square': // Alias
      return <rect x={`${x - w/2}%`} y={`${y - h/2}%`} width={`${w}%`} height={`${h}%`} style={commonStyle} />;
    
    case 'triangle':
      // Equilateral triangle
      const r = w / 2;
      const points = [
        `${x},${y - r}`,
        `${x - r * 0.866},${y + r * 0.5}`,
        `${x + r * 0.866},${y + r * 0.5}`
      ].join(' ');
      return <polygon points={points.replace(/%/g, '')} points-unit="%" style={commonStyle} />;
      
    case 'star':
      const outerR = w / 2;
      const innerR = w / 2.6; // Standard 5-point star ratio
      let d = '';
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? outerR : innerR;
        const angle = (i * 36 - 90) * (Math.PI / 180);
        const px = x + rad * Math.cos(angle);
        const py = y + rad * Math.sin(angle);
        d += (i === 0 ? 'M' : 'L') + `${px.toFixed(2)},${py.toFixed(2)} `;
      }
      d += 'Z';
      return <path d={d} style={commonStyle} />;

    case 'line':
      return <line x1={`${x}%`} y1={`${y}%`} x2={`${el.x2 ?? x + w}%`} y2={`${el.y2 ?? y}%`} style={{...commonStyle, fill: 'none', stroke: '#000'}} />;

    case 'text':
      return (
        <text 
          x={`${x}%`} 
          y={`${y}%`} 
          textAnchor="middle" 
          dominantBaseline="middle" 
          fontSize={el.fontSize || w || 20}
          fill={fill === 'white' ? '#fff' : '#000'}
          fontWeight="bold"
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${x}% ${y}%`, fontFamily: '"Noto Serif SC", serif' }}
        >
          {el.text}
        </text>
      );

    case 'dot_matrix':
      if (!el.matrixRows || !el.matrixCols || !el.matrixData) return null;
      const rows = el.matrixRows;
      const cols = el.matrixCols;
      const cellW = 100 / cols;
      const cellH = 100 / rows;
      const dotSize = Math.min(cellW, cellH) * 0.6; // Dot size relative to grid cell
      
      return (
        <g>
           {el.matrixData.map((val, i) => {
             if (val === 2) return null; // Empty
             const r = Math.floor(i / cols);
             const c = i % cols;
             const cx = c * cellW + cellW / 2;
             const cy = r * cellH + cellH / 2;
             return (
               <circle 
                 key={i} 
                 cx={`${cx}%`} 
                 cy={`${cy}%`} 
                 r={`${dotSize/2}%`} 
                 fill={val === 1 ? '#000' : '#fff'}
                 stroke="#000"
                 strokeWidth={1.5}
               />
             );
           })}
        </g>
      );

    default:
      // Debug helper for unknown types
      if (process.env.NODE_ENV === 'development') {
          return <text x="50%" y="50%" fontSize="10" textAnchor="middle" fill="red">Unknown: {type}</text>;
      }
      return null;
  }
};

const RenderCell: React.FC<{ cell: GraphicCell; width?: string; height?: string; bordered?: boolean }> = ({ cell, width = '100%', height = '100%', bordered = true }) => {
  return (
    <div className={`relative bg-white overflow-hidden ${bordered ? 'border border-stone-800' : ''}`} style={{ width, height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        {cell.elements && cell.elements.length > 0 ? (
            cell.elements.map((el, i) => (
                <RenderShape key={i} el={el} />
            ))
        ) : (
            // Debug helper for empty cells
            process.env.NODE_ENV === 'development' ? <text x="50%" y="50%" fontSize="10" textAnchor="middle" fill="#ccc">Empty Data</text> : null
        )}
      </svg>
    </div>
  );
};

export const GraphicStemRenderer: React.FC<{ data: QuestionStemGraphic }> = ({ data }) => {
  const { layout, cells } = data;

  if (layout === 'matrix_3x3') {
    return (
      <div className="grid grid-cols-3 gap-px border-2 border-stone-800 w-full max-w-[360px] mx-auto aspect-square bg-stone-800">
        {Array.from({ length: 9 }).map((_, i) => {
          const cell = cells[i];
          if (!cell || i === 8) { // 9th cell is usually the question mark or empty
             return (
                <div key={i} className="bg-white flex items-center justify-center text-4xl font-serif text-stone-800">
                   ?
                </div>
             );
          }
          return <RenderCell key={i} cell={cell} bordered={false} />;
        })}
      </div>
    );
  }

  if (layout.startsWith('sequence')) {
    // Heuristic: Remove last cell if it looks like a generic placeholder (single short line or dash)
    // This fixes AI hallucination where it puts a "-" or empty slot as a cell
    const visibleCells = cells.filter((cell, index) => {
        if (index !== cells.length - 1) return true;
        if (!cell.elements || cell.elements.length === 0) return false;
        if (cell.elements.length === 1) {
            const el = cell.elements[0];
            // Check for center horizontal line (hyphen-like)
            if (el.type === 'line' && Math.abs((el.y || 50) - 50) < 5 && (el.w || 0) < 50) return false;
            // Check for text "-"
            if (el.type === 'text' && (el.text === '-' || el.text === '?' || el.text === '？')) return false;
        }
        return true;
    });

    return (
      <div className="flex flex-col gap-4">
          <div className="flex gap-2 w-full overflow-x-auto pb-2">
             {visibleCells.map((cell, i) => (
                <div key={i} className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32">
                    <RenderCell cell={cell} />
                </div>
             ))}
             {/* Append '?' placeholder if sequence length is typical (3-5), to imply next step */}
             {visibleCells.length < 6 && (
                 <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 border border-stone-300 bg-stone-50 flex items-center justify-center text-3xl text-stone-400 font-serif">
                    ?
                 </div>
             )}
          </div>
      </div>
    );
  }

  return <div>Unknown Layout</div>;
};

export const GraphicOptionRenderer: React.FC<{ data: GraphicCell }> = ({ data }) => {
  return (
    <div className="w-full aspect-square max-w-[120px] mx-auto">
       <RenderCell cell={data} />
    </div>
  );
};

export const tryParseGraphicData = (str: string) => {
    try {
        let trimmed = str.trim();
        // Strip markdown code blocks if present
        trimmed = trimmed.replace(/^```(json)?\s*/i, '').replace(/\s*```$/, '');

        // Simple check to avoid parsing normal text
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
            const data = JSON.parse(trimmed);
            // Verify minimal structure
            if (data.layout || data.elements) return data;
        }
    } catch (e) { return null; }
    return null;
};