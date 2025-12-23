import * as XLSX from 'xlsx';
import { ParsedSheet } from '../types';

export const parseExcelFile = async (file: File): Promise<ParsedSheet[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        const result: ParsedSheet[] = [];
        
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          // Convert sheet to JSON, treating first row as header
          const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          result.push({
            name: sheetName,
            data: jsonData,
          });
        });

        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};