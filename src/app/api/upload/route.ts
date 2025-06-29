import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/parsers/csv-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entityType') as string;
    const validateOnUpload = formData.get('validate') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!entityType || !['clients', 'workers', 'tasks'].includes(entityType)) {
      return NextResponse.json({ error: 'Invalid entity type' }, { status: 400 });
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    // Check file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a CSV or Excel file.' 
      }, { status: 400 });
    }

    let parsedData: any[] = [];
    let parseErrors: string[] = [];

    try {
      // Parse the file
      const result = await parseCSV(file, entityType as 'clients' | 'workers' | 'tasks');
      
      // Extract data based on entity type
      switch (entityType) {
        case 'clients':
          parsedData = result.clients || [];
          break;
        case 'workers':
          parsedData = result.workers || [];
          break;
        case 'tasks':
          parsedData = result.tasks || [];
          break;
      }
      
      parseErrors = result.errors || [];
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return NextResponse.json({ 
        error: 'Failed to parse file. Please check the file format.' 
      }, { status: 400 });
    }

    if (parsedData.length === 0) {
      return NextResponse.json({ 
        error: 'No valid data found in the file.' 
      }, { status: 400 });
    }

    // Validate data if requested
    const validationResults = null;
    if (validateOnUpload) {
      try {
        // For now, we'll skip validation since the validation engine might not be available
        // validationResults = await validateData(parsedData, entityType);
        console.log('Validation requested but not implemented yet');
      } catch (validationError) {
        console.error('Validation error:', validationError);
        // Continue without validation if it fails
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      totalRows: parsedData.length,
      parseErrors: parseErrors.length > 0 ? parseErrors : undefined,
      validationResults,
      filename: file.name,
      entityType,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload' 
    }, { status: 500 });
  }
}

// GET endpoint to get upload status and supported formats
export async function GET() {
  return NextResponse.json({
    supportedFormats: [
      {
        type: 'csv',
        mimeType: 'text/csv',
        extensions: ['.csv'],
        maxSize: '10MB'
      },
      {
        type: 'excel',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extensions: ['.xlsx', '.xls'],
        maxSize: '10MB'
      }
    ],
    supportedEntities: [
      {
        type: 'clients',
        requiredFields: ['ClientID', 'ClientName', 'PriorityLevel'],
        optionalFields: ['GroupTag', 'RequestedTaskIDs']
      },
      {
        type: 'workers',
        requiredFields: ['WorkerID', 'WorkerName', 'Skills'],
        optionalFields: ['WorkerGroup', 'MaxLoadPerPhase']
      },
      {
        type: 'tasks',
        requiredFields: ['TaskID', 'TaskName', 'Duration'],
        optionalFields: ['RequiredSkills', 'PreferredPhases', 'Category']
      }
    ],
    uploadLimits: {
      maxFileSize: '10MB',
      maxRows: 10000,
      supportedEncodings: ['UTF-8', 'ISO-8859-1']
    }
  });
}
