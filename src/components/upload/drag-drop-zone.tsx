import React, { useRef } from 'react';

interface DragDropZoneProps {
  onFilesSelected: (files: FileList) => void;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({ onFilesSelected }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={handleClick}
      style={{
        border: '2px dashed #aaa',
        borderRadius: 8,
        padding: 32,
        textAlign: 'center',
        cursor: 'pointer',
        background: '#fafafa',
      }}
    >
      <input
        type="file"
        multiple
        accept=".csv,.xlsx"
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handleChange}
      />
      <p>Drag and drop CSV/XLSX files here, or click to select files</p>
    </div>
  );
};
