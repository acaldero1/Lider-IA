import { GoogleGenAI, Type } from "@google/genai";
import { ParsedSheet, SimulationReport } from "../types";

const SYSTEM_INSTRUCTION = `
Eres un analista de operaciones experto y consultor en simulación (ej. Arena Rockwell).
Tu objetivo es analizar datos crudos de hojas de cálculo de simulación y generar un informe ejecutivo JSON.

Reglas de Análisis:
1.  **Prioridad de Hojas**: Usa 'AcrossReplicationsSummary' como la verdad base. Usa 'DiscreteTimeStats', 'CounterStats', etc., para detalles.
2.  **Extracción de KPIs**: Busca tiempos de espera (Wait Time), tiempos en sistema (Total Time), utilización de recursos (Utilization), y colas (Number in Queue).
3.  **Insights**: Identifica cuellos de botella (utilización > 85%, colas largas), riesgos (alta variabilidad), y oportunidades.
4.  **Recomendaciones**: Da consejos prácticos de negocio (agregar capacidad, cambiar reglas).

Formato de Salida (JSON):
Debes generar un JSON válido con la estructura especificada en el esquema.
Para los gráficos (charts), extrae datos reales del input. Si no hay datos exactos, estima o deja el array vacío.
- resourceUtilization: Extrae nombres de recursos y su % de utilización promedio (0-1 o 0-100).
- queueTimes: Extrae nombres de colas y su tiempo promedio de espera.
`;

export const analyzeSimulationData = async (sheets: ParsedSheet[]): Promise<SimulationReport> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Optimize token usage: Only send relevant sheets and limit rows if necessary
  // For a real app, we might need to summarize chunks. Here we truncate strictly.
  const relevantSheets = sheets.filter(s => 
    ['ProjectInformation', 'AcrossReplicationsSummary', 'DiscreteTimeStatsByRep', 'CounterStatsByRep', 'OutputStatByStep', 'FrequencyStatsByRep']
    .some(key => s.name.includes(key) || key.includes(s.name))
  );
  
  // If no known sheets, use all but truncate heavily
  const payloadData = relevantSheets.length > 0 ? relevantSheets : sheets;

  const dataString = JSON.stringify(payloadData).substring(0, 500000); // Token limit safety

  const prompt = `
    Analiza este archivo de simulación (formato JSON derivado de Excel).
    Hojas detectadas: ${sheets.map(s => s.name).join(', ')}.
    
    Genera un reporte consultivo.
    Datos: ${dataString}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.OBJECT,
            properties: {
              detectedSheets: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSheets: { type: Type.ARRAY, items: { type: Type.STRING } },
              overview: { type: Type.STRING },
            },
          },
          kpis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING }, // String to handle formatting flexibility
                unit: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
              }
            }
          },
          charts: {
            type: Type.OBJECT,
            properties: {
              resourceUtilization: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                  }
                }
              },
              queueTimes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                  }
                }
              }
            }
          },
          insights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['bottleneck', 'risk', 'opportunity'] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
              }
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                action: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  return JSON.parse(response.text) as SimulationReport;
};