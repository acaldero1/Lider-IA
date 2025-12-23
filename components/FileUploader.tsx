import React, { useRef } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isLoading) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndProcess(files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      onFileSelect(file);
    } else {
      alert('Por favor cargue un archivo Excel válido (.xlsx o .xls)');
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        isLoading
          ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
          : 'border-[#DD689D]/40 bg-[#DD689D]/5 hover:bg-[#DD689D]/10 hover:border-[#DD689D] cursor-pointer'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !isLoading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".xlsx, .xls"
        onChange={handleChange}
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isLoading ? 'bg-gray-200' : 'bg-[#DD689D]/20 text-[#DD689D]'}`}>
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          ) : (
            <UploadCloud size={32} />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isLoading ? 'Analizando Simulación...' : 'Cargar Reporte de Simulación'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Arrastra tu archivo Excel (Arena, Simio, etc.) aquí, o haz clic para buscar.
          </p>
        </div>

        {!isLoading && (
          <div className="flex items-center space-x-2 text-xs text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-200">
            <FileSpreadsheet size={14} />
            <span>Soporta .xlsx, .xls</span>
          </div>
        )}
      </div>
    </div>
  );
};