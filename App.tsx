import React, { useState } from 'react';
import { parseExcelFile } from './utils/excelUtils';
import { analyzeSimulationData } from './services/geminiService';
import { FileUploader } from './components/FileUploader';
import { AnalysisReportView } from './components/AnalysisReportView';
import { AnalysisStatus, ParsedSheet, SimulationReport } from './types';
import { Activity, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [report, setReport] = useState<SimulationReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    try {
      setStatus(AnalysisStatus.PARSING);
      setErrorMsg(null);
      
      const sheets: ParsedSheet[] = await parseExcelFile(file);
      
      if (sheets.length === 0) {
        throw new Error("No se encontraron datos legibles en el archivo.");
      }

      setStatus(AnalysisStatus.ANALYZING);
      
      const analysisResult = await analyzeSimulationData(sheets);
      
      setReport(analysisResult);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg(err.message || "Ocurrió un error desconocido durante el análisis.");
    }
  };

  const handleReset = () => {
    setStatus(AnalysisStatus.IDLE);
    setReport(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#DD689D] rounded-lg">
                <Terminal className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                 <h1 className="text-xl font-bold text-slate-900 leading-tight">SimConsultant AI</h1>
                 <span className="text-xs text-slate-500 font-medium tracking-wide">OPERATIONS ANALYTICS</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-slate-500">
               <span>Desarrollado con Gemini 2.5 Flash</span>
               <div className="h-4 w-px bg-slate-300"></div>
               <Activity size={16} />
               <span>Estado: {status === AnalysisStatus.IDLE ? 'Listo' : 'Procesando'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Intro / Empty State */}
        {status === AnalysisStatus.IDLE && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Convierte tus reportes de simulación en decisiones
              </h2>
              <p className="text-lg text-slate-600">
                Sube tu archivo de Excel generado por Arena, Simio o similar. 
                Nuestra IA analizará KPIs, detectará cuellos de botella y generará recomendaciones ejecutivas al instante.
              </p>
            </div>
            
            <FileUploader 
              onFileSelect={handleFileSelect} 
              isLoading={false} 
            />

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
               <div className="p-4">
                 <div className="font-bold text-slate-900 mb-1">Detecta Hojas</div>
                 <p className="text-sm text-slate-500">Identifica automáticamente la estructura del reporte.</p>
               </div>
               <div className="p-4">
                 <div className="font-bold text-slate-900 mb-1">Visualiza KPIs</div>
                 <p className="text-sm text-slate-500">Gráficos automáticos de utilización y colas.</p>
               </div>
               <div className="p-4">
                 <div className="font-bold text-slate-900 mb-1">Consultoría AI</div>
                 <p className="text-sm text-slate-500">Insights de negocio y recomendaciones claras.</p>
               </div>
            </div>
          </div>
        )}

        {/* Loading States */}
        {(status === AnalysisStatus.PARSING || status === AnalysisStatus.ANALYZING) && (
          <div className="max-w-2xl mx-auto text-center py-20">
             <div className="inline-block relative">
               <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#DD689D]/20 border-t-[#DD689D]"></div>
             </div>
             <h3 className="mt-6 text-xl font-semibold text-slate-900">
               {status === AnalysisStatus.PARSING ? 'Leyendo estructura del archivo...' : 'Generando análisis consultivo...'}
             </h3>
             <p className="mt-2 text-slate-500">
               Esto puede tomar unos segundos mientras Gemini procesa los datos de las réplicas.
             </p>
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
          <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
              <Activity className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Error en el análisis</h3>
            <p className="text-red-700 mb-6">{errorMsg}</p>
            <button 
              onClick={handleReset}
              className="px-6 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Results View */}
        {status === AnalysisStatus.COMPLETE && report && (
          <AnalysisReportView report={report} onReset={handleReset} />
        )}

      </main>
    </div>
  );
};

export default App;