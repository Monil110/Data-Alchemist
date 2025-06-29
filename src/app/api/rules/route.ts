import { NextRequest, NextResponse } from 'next/server';
import { BusinessRule, RuleType } from '@/types';

// In-memory storage for rules (in a real app, this would be a database)
const rules: BusinessRule[] = [
  {
    id: 'rule-001',
    type: RuleType.CO_RUN,
    name: 'High Priority Task Coordination',
    description: 'Ensure high priority tasks run together',
    parameters: {
      taskIds: ['T001', 'T002'],
      mustRunTogether: true
    },
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'rule-002',
    type: RuleType.LOAD_LIMIT,
    name: 'Worker Load Protection',
    description: 'Limit worker load to prevent overloading',
    parameters: {
      workerGroup: 'frontend',
      maxLoadPerPhase: 3
    },
    isActive: true,
    createdAt: new Date('2024-01-02')
  }
];

// GET - List all rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');

    let filteredRules = [...rules];

    // Filter by type
    if (type && Object.values(RuleType).includes(type as RuleType)) {
      filteredRules = filteredRules.filter(rule => rule.type === type);
    }

    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      filteredRules = filteredRules.filter(rule => rule.isActive === isActive);
    }

    return NextResponse.json({
      rules: filteredRules,
      total: filteredRules.length,
      types: Object.values(RuleType)
    });
  } catch (error) {
    console.error('GET rules error:', error);
    return NextResponse.json({ error: 'Failed to fetch rules' }, { status: 500 });
  }
}

// POST - Create a new rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, name, description, parameters } = body;

    // Validation
    if (!type || !Object.values(RuleType).includes(type)) {
      return NextResponse.json({ 
        error: 'Invalid rule type. Must be one of: ' + Object.values(RuleType).join(', ') 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Rule name is required' }, { status: 400 });
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Rule description is required' }, { status: 400 });
    }

    if (!parameters || typeof parameters !== 'object') {
      return NextResponse.json({ error: 'Rule parameters are required' }, { status: 400 });
    }

    // Check for duplicate names
    const existingRule = rules.find(rule => rule.name.toLowerCase() === name.toLowerCase());
    if (existingRule) {
      return NextResponse.json({ error: 'A rule with this name already exists' }, { status: 409 });
    }

    // Create new rule
    const newRule: BusinessRule = {
      id: `rule-${Date.now()}`,
      type: type as RuleType,
      name: name.trim(),
      description: description.trim(),
      parameters,
      isActive: true,
      createdAt: new Date()
    };

    rules.push(newRule);

    return NextResponse.json({
      rule: newRule,
      message: 'Rule created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('POST rules error:', error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}

// PUT - Update a rule
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, name, description, parameters, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const ruleIndex = rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const existingRule = rules[ruleIndex];
    if (!existingRule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    // Update fields
    if (type && Object.values(RuleType).includes(type)) {
      existingRule.type = type as RuleType;
    }

    if (name && typeof name === 'string' && name.trim().length > 0) {
      // Check for duplicate names (excluding current rule)
      const duplicateRule = rules.find(rule => 
        rule.id !== id && rule.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicateRule) {
        return NextResponse.json({ error: 'A rule with this name already exists' }, { status: 409 });
      }
      existingRule.name = name.trim();
    }

    if (description && typeof description === 'string') {
      existingRule.description = description.trim();
    }

    if (parameters && typeof parameters === 'object') {
      existingRule.parameters = parameters;
    }

    if (typeof isActive === 'boolean') {
      existingRule.isActive = isActive;
    }

    rules[ruleIndex] = existingRule;

    return NextResponse.json({
      rule: existingRule,
      message: 'Rule updated successfully'
    });

  } catch (error) {
    console.error('PUT rules error:', error);
    return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 });
  }
}

// DELETE - Delete a rule
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const ruleIndex = rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const deletedRule = rules.splice(ruleIndex, 1)[0];

    return NextResponse.json({
      message: 'Rule deleted successfully',
      deletedRule
    });

  } catch (error) {
    console.error('DELETE rules error:', error);
    return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 });
  }
}
