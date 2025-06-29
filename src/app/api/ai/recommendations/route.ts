import { NextRequest, NextResponse } from 'next/server';
import { BusinessRule } from '@/types/rules';
import { aiClient } from '@/lib/ai/ai-client';

export async function POST(req: NextRequest) {
  const { clients, workers, tasks } = await req.json();

  if (!process.env['GEMINI_API_KEY']) {
    return NextResponse.json({ error: 'Gemini API key not set.' }, { status: 500 });
  }

  const analyzeData = (clients: any[], workers: any[], tasks: any[]) => {
    const insights = {
      clientCount: clients.length,
      workerCount: workers.length,
      taskCount: tasks.length,
      highPriorityClients: clients.filter(c => c.PriorityLevel >= 4).length,
      overloadedWorkers: workers.filter(w => w.MaxLoadPerPhase > 5).length,
      longTasks: tasks.filter(t => t.Duration > 3).length,
      skillGaps: [] as string[],
      potentialConflicts: [] as string[],
    };

    // Analyze skill gaps
    const requiredSkills = new Set(tasks.flatMap(t => t.RequiredSkills || []));
    const availableSkills = new Set(workers.flatMap(w => w.Skills || []));
    const missingSkills = Array.from(requiredSkills).filter(skill => !availableSkills.has(skill));
    insights.skillGaps = missingSkills;

    // Analyze potential conflicts
    if (insights.highPriorityClients > insights.workerCount) {
      insights.potentialConflicts.push('High priority clients may exceed worker capacity');
    }

    return insights;
  };

  const generateRecommendations = (insights: any) => {
    const recommendations: BusinessRule[] = [];

    // Recommendation 1: Load limit rule if workers are overloaded
    if (insights.overloadedWorkers > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        name: 'Worker Load Protection',
        description: 'Limit worker load to prevent overloading based on current data patterns',
        type: 'load-limit',
        enabled: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        workerGroup: workers.map((w: any) => w.WorkerGroup).filter(Boolean),
        maxSlotsPerPhase: 4,
        phaseType: 'all',
      } as any);
    }

    // Recommendation 2: Co-run rule for high priority clients
    if (insights.highPriorityClients > 1) {
      recommendations.push({
        id: `rec_${Date.now()}_2`,
        name: 'High Priority Task Coordination',
        description: 'Ensure high priority tasks run together for better resource allocation',
        type: 'co-run',
        enabled: true,
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        taskIds: tasks.filter((t: any) => t.Category === 'high-priority').map((t: any) => t.TaskID),
        mustRunTogether: true,
      } as any);
    }

    // Recommendation 3: Slot restriction for skill gaps
    if (insights.skillGaps.length > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_3`,
        name: 'Skill-Based Slot Allocation',
        description: 'Restrict slots to workers with required skills to address skill gaps',
        type: 'slot-restriction',
        enabled: true,
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientGroup: clients.map((c: any) => c.GroupTag).filter(Boolean),
        workerGroup: workers.map((w: any) => w.WorkerGroup).filter(Boolean),
        minCommonSlots: 2,
      } as any);
    }

    // Recommendation 4: Phase window for long tasks
    if (insights.longTasks > 0) {
      recommendations.push({
        id: `rec_${Date.now()}_4`,
        name: 'Long Task Scheduling',
        description: 'Optimize scheduling for long-duration tasks',
        type: 'phase-window',
        enabled: true,
        priority: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        taskId: tasks.find((t: any) => t.Duration > 3)?.TaskID || '',
        allowedPhases: ['morning', 'afternoon'],
        phaseRange: { start: 1, end: 3 },
      } as any);
    }

    return recommendations;
  };

  try {
    const insights = analyzeData(clients, workers, tasks);
    const recommendations = generateRecommendations(insights);

    // If we have recommendations, enhance them with AI
    if (recommendations.length > 0) {
      try {
        const aiSuggestions = await aiClient.generateRecommendations(insights);
        
        // Enhance recommendations with AI insights
        if (aiSuggestions) {
          recommendations.forEach((rec, index) => {
            rec.description = `${rec.description} ${aiSuggestions.split('\n')[index] || ''}`;
          });
        }
      } catch (aiError) {
        console.error('AI enhancement failed:', aiError);
        // Continue without AI enhancement
      }
    }

    return NextResponse.json({ 
      recommendations,
      insights,
      totalRecommendations: recommendations.length 
    });
  } catch (e) {
    console.error('AI recommendations error:', e);
    return NextResponse.json({ error: 'Failed to generate recommendations.' }, { status: 500 });
  }
}
