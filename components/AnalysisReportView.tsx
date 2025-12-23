import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import { 
  AlertTriangle, CheckCircle, TrendingUp, TrendingDown, 
  Minus, Activity, BarChart2, Lightbulb, ClipboardList 
} from 'lucide-react';
import { SimulationReport } from '../types';

interface AnalysisReportViewProps {
  report: SimulationReport;
  onReset: () => void;
}

export const AnalysisReportView: React.FC<AnalysisReportViewProps> = ({ report, onReset }) => {
  // Updated primary color to #DD689D
  const COLORS = ['#DD689D', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Resumen Ejecutivo de Simulación</h2>
            <p className="text-slate-500 text-sm mt-1">Análisis automático basado en {report.summary.detectedSheets.length} hojas detectadas.</p>
          </div>
          <button 
            onClick={onReset}
            className="text-sm text-slate-500 hover:text-slate-800 underline decoration-slate-300 underline-offset-4"
          >
            Analizar otro archivo
          </button>
        </div>
        
        <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
          {report.summary.overview}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {report.summary.detectedSheets.map(sheet => (
             <span key={sheet} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
               <CheckCircle size={12} className="mr-1" /> {sheet}
             </span>
          ))}
          {report.summary.missingSheets.length > 0 && (
             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
               <Minus size={12} className="mr-1" /> {report.summary.missingSheets.length} hojas omitidas
             </span>
          )}
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {report.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 text-sm font-medium uppercase tracking-wide">{kpi.label}</span>
              {kpi.trend === 'up' && <TrendingUp size={16} className="text-red-500" />}
              {kpi.trend === 'down' && <TrendingDown size={16} className="text-green-500" />}
              {kpi.trend === 'stable' && <Minus size={16} className="text-slate-400" />}
            </div>
            <div className="mt-4">
              <span className="text-3xl font-bold text-slate-900">{kpi.value}</span>
              <span className="text-slate-400 text-sm ml-1">{kpi.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resource Utilization */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-[#DD689D]/20 rounded-lg mr-3">
              <BarChart2 className="text-[#DD689D]" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Utilización de Recursos</h3>
          </div>
          
          <div className="h-72 w-full">
            {report.charts.resourceUtilization.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.charts.resourceUtilization} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} />
                  <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Utilización']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {report.charts.resourceUtilization.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 0.85 ? '#ef4444' : '#DD689D'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                Datos insuficientes para graficar utilización
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4 text-center">
            * Barras rojas indican utilización crítica {'>'} 85%
          </p>
        </div>

        {/* Queue Times */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-amber-100 rounded-lg mr-3">
              <Activity className="text-amber-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tiempos de Espera (Colas)</h3>
          </div>
          
          <div className="h-72 w-full">
            {report.charts.queueTimes.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <BarChart data={report.charts.queueTimes}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={60} />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tiempo Espera" />
               </BarChart>
             </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic bg-slate-50 rounded-lg">
                Datos insuficientes para graficar colas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h3 className="text-xl font-bold text-slate-900 flex items-center">
             <Lightbulb className="mr-2 text-yellow-500" /> Insights Operativos
           </h3>
           {report.insights.map((insight, idx) => (
             <div key={idx} className={`p-4 rounded-lg border-l-4 shadow-sm ${
               insight.type === 'bottleneck' ? 'bg-red-50 border-red-500' :
               insight.type === 'risk' ? 'bg-orange-50 border-orange-500' :
               'bg-[#DD689D]/10 border-[#DD689D]'
             }`}>
               <div className="flex items-center mb-2">
                 {insight.type === 'bottleneck' && <AlertTriangle size={16} className="text-red-600 mr-2" />}
                 {insight.type === 'risk' && <Activity size={16} className="text-orange-600 mr-2" />}
                 {insight.type === 'opportunity' && <CheckCircle size={16} className="text-[#DD689D] mr-2" />}
                 <h4 className="font-semibold text-slate-800">{insight.title}</h4>
               </div>
               <p className="text-sm text-slate-700">{insight.description}</p>
             </div>
           ))}
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6">
           <h3 className="text-xl font-bold text-slate-900 flex items-center">
             <ClipboardList className="mr-2 text-indigo-500" /> Recomendaciones Ejecutivas
           </h3>
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold text-slate-800">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{rec.action}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};