import { NextRequest, NextResponse } from 'next/server';
import { BusinessRule } from '@/types/rules';

// In-memory storage for rules (in a real app, this would be a database)
const rules: BusinessRule[] = [
  {
    id: 'rule-001',
    type: 'co-run',
    name: 'High Priority Task Coordination',
    description: 'Ensure high priority tasks run together',
    enabled: true,
    priority: 1,
    taskIds: ['T001', 'T002'],
    mustRunTogether: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'rule-002',
    type: 'load-limit',
    name: 'Worker Load Protection',
    description: 'Limit worker load to prevent overloading',
    enabled: true,
    priority: 2,
    workerGroup: ['frontend'],
    maxSlotsPerPhase: 3,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  }
];

// GET - List all rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const enabled = searchParams.get('enabled');

    let filteredRules = [...rules];

    // Filter by type
    if (type) {
      filteredRules = filteredRules.filter(rule => rule.type === type);
    }

    // Filter by enabled status
    if (enabled !== null) {
      const isEnabled = enabled === 'true';
      filteredRules = filteredRules.filter(rule => rule.enabled === isEnabled);
    }

    return NextResponse.json({
      rules: filteredRules,
      total: filteredRules.length,
      types: [
        'co-run',
        'slot-restriction',
        'load-limit',
        'phase-window',
        'pattern-match',
        'precedence-override',
      ],
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
    const { type, name, description, ...rest } = body;

    // Validation
    if (!type || typeof type !== 'string') {
      return NextResponse.json({ error: 'Rule type is required.' }, { status: 400 });
    }
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Rule name is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string') {
      return NextResponse.json({ error: 'Rule description is required' }, { status: 400 });
    }
    // Check for duplicate names
    const existingRule = rules.find(rule => rule.name.toLowerCase() === name.toLowerCase());
    if (existingRule) {
      return NextResponse.json({ error: 'A rule with this name already exists' }, { status: 409 });
    }

    let newRule: BusinessRule;
    const base = {
      id: `rule-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      enabled: true,
      priority: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    if (type === 'co-run') {
      if (!Array.isArray(rest.taskIds) || typeof rest.mustRunTogether !== 'boolean') {
        return NextResponse.json({ error: 'taskIds (string[]) and mustRunTogether (boolean) are required for co-run rule.' }, { status: 400 });
      }
      newRule = {
        ...base,
        type: 'co-run',
        taskIds: rest.taskIds,
        mustRunTogether: rest.mustRunTogether,
      };
    } else if (type === 'load-limit') {
      if (!Array.isArray(rest.workerGroup) || typeof rest.maxSlotsPerPhase !== 'number') {
        return NextResponse.json({ error: 'workerGroup (string[]) and maxSlotsPerPhase (number) are required for load-limit rule.' }, { status: 400 });
      }
      newRule = {
        ...base,
        type: 'load-limit',
        workerGroup: rest.workerGroup,
        maxSlotsPerPhase: rest.maxSlotsPerPhase,
      };
    } else {
      return NextResponse.json({ error: 'Only co-run and load-limit rules are supported in this mock.' }, { status: 400 });
    }

    rules.push(newRule);
    return NextResponse.json({ rule: newRule, message: 'Rule created successfully' }, { status: 201 });
  } catch (error) {
    console.error('POST rules error:', error);
    return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });
  }
}

// PUT - Update a rule
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, type, name, description, ...rest } = body;
    if (!id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }
    const ruleIndex = rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }
    let updatedRule = { ...rules[ruleIndex] } as BusinessRule;
    if (type && ['co-run', 'slot-restriction', 'load-limit', 'phase-window', 'pattern-match', 'precedence-override'].includes(type)) {
      updatedRule.type = type as BusinessRule['type'];
    }
    if (name && typeof name === 'string' && name.trim().length > 0) {
      // Check for duplicate names (excluding current rule)
      const duplicateRule = rules.find(rule => rule.id !== id && rule.name.toLowerCase() === name.toLowerCase());
      if (duplicateRule) {
        return NextResponse.json({ error: 'A rule with this name already exists' }, { status: 409 });
      }
      updatedRule.name = name.trim();
    }
    if (description && typeof description === 'string') {
      updatedRule.description = description.trim();
    }
    updatedRule.updatedAt = new Date();
    // Update type-specific fields
    if (updatedRule.type === 'co-run') {
      if (rest.taskIds) updatedRule.taskIds = rest.taskIds;
      if (typeof rest.mustRunTogether === 'boolean') updatedRule.mustRunTogether = rest.mustRunTogether;
    } else if (updatedRule.type === 'load-limit') {
      if (rest.workerGroup) updatedRule.workerGroup = rest.workerGroup;
      if (typeof rest.maxSlotsPerPhase === 'number') updatedRule.maxSlotsPerPhase = rest.maxSlotsPerPhase;
    }
    rules[ruleIndex] = updatedRule;
    return NextResponse.json({ rule: updatedRule, message: 'Rule updated successfully' });
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
