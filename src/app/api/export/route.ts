import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { data, format, entityType, filename } = await req.json();

    if (!data || !Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid data provided' }, { status: 400 });
    }

    if (!format || !['csv', 'json', 'xlsx'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Supported: csv, json, xlsx' }, { status: 400 });
    }

    let exportData: string | Buffer;
    let contentType: string;
    let fileExtension: string;

    switch (format) {
      case 'csv':
        exportData = convertToCSV(data);
        contentType = 'text/csv';
        fileExtension = 'csv';
        break;
      
      case 'json':
        exportData = JSON.stringify(data, null, 2);
        contentType = 'application/json';
        fileExtension = 'json';
        break;
      
      case 'xlsx':
        exportData = await convertToXLSX(data);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
        break;
      
      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

    const finalFilename = filename || `${entityType || 'data'}_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

    return new NextResponse(exportData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

async function convertToXLSX(data: any[]): Promise<Buffer> {
  // For now, return a simple CSV format as XLSX
  // In a real implementation, you'd use a library like 'xlsx'
  const csvData = convertToCSV(data);
  return Buffer.from(csvData, 'utf-8');
}

// GET endpoint for downloading sample data
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get('entity');
  const format = searchParams.get('format') || 'csv';

  if (!entityType || !['clients', 'workers', 'tasks'].includes(entityType)) {
    return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
  }

  // Generate sample data based on entity type
  let sampleData: any[] = [];
  
  switch (entityType) {
    case 'clients':
      sampleData = [
        {
          ClientID: 'C001',
          ClientName: 'Acme Corp',
          PriorityLevel: 5,
          GroupTag: 'enterprise',
          RequestedTaskIDs: ['T001', 'T002']
        },
        {
          ClientID: 'C002',
          ClientName: 'TechStart Inc',
          PriorityLevel: 3,
          GroupTag: 'startup',
          RequestedTaskIDs: ['T003']
        }
      ];
      break;
    
    case 'workers':
      sampleData = [
        {
          WorkerID: 'W001',
          WorkerName: 'John Doe',
          Skills: ['JavaScript', 'React'],
          WorkerGroup: 'frontend',
          MaxLoadPerPhase: 3
        },
        {
          WorkerID: 'W002',
          WorkerName: 'Jane Smith',
          Skills: ['Python', 'Django'],
          WorkerGroup: 'backend',
          MaxLoadPerPhase: 4
        }
      ];
      break;
    
    case 'tasks':
      sampleData = [
        {
          TaskID: 'T001',
          TaskName: 'Frontend Development',
          Duration: 2,
          RequiredSkills: ['JavaScript', 'React'],
          PreferredPhases: [1, 2]
        },
        {
          TaskID: 'T002',
          TaskName: 'Backend API',
          Duration: 3,
          RequiredSkills: ['Python', 'Django'],
          PreferredPhases: [2, 3]
        }
      ];
      break;
  }

  let exportData: string;
  let contentType: string;
  let fileExtension: string;

  switch (format) {
    case 'csv':
      exportData = convertToCSV(sampleData);
      contentType = 'text/csv';
      fileExtension = 'csv';
      break;
    
    case 'json':
      exportData = JSON.stringify(sampleData, null, 2);
      contentType = 'application/json';
      fileExtension = 'json';
      break;
    
    default:
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  }

  const filename = `sample_${entityType}.${fileExtension}`;

  return new NextResponse(exportData, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
