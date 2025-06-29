# Data Alchemist 🧪

A comprehensive data management platform that transforms messy spreadsheets into clean, validated data with AI-powered insights and business rules for optimal resource allocation.

## 🚀 Features

### ✅ **FULLY IMPLEMENTED**

#### **Milestone 1: Data Ingestion, Validators and In-App Changes**

##### **Data Ingestion** ✅
- **CSV/XLSX Upload**: Drag-and-drop interface with file type detection
- **AI Header Mapping**: Smart fuzzy matching for wrongly named columns
- **Data Grid Display**: All three entities (clients, workers, tasks) with inline editing
- **File Type Detection**: Automatic entity type detection from filename
- **Real-time Validation**: Immediate feedback on upload and edits

##### **Validation Engine** ✅ (12+ Core Validations)
- **Missing Required Columns**: Detects and reports missing essential fields
- **Duplicate IDs**: Identifies duplicate ClientID/WorkerID/TaskID
- **Malformed Lists**: Validates numeric arrays in AvailableSlots
- **Out-of-Range Values**: Checks PriorityLevel (1-5) and Duration (≥1)
- **Broken JSON**: Validates AttributesJSON format
- **Unknown References**: Verifies RequestedTaskIDs exist in tasks
- **Circular Co-run Groups**: Detects A→B→C→A patterns
- **Conflicting Rules**: Validates phase-window constraints
- **Overloaded Workers**: Checks AvailableSlots.length < MaxLoadPerPhase
- **Phase-slot Saturation**: Validates task duration vs worker slots
- **Skill-coverage Matrix**: Ensures RequiredSkill maps to ≥1 worker
- **Max-concurrency Feasibility**: Validates MaxConcurrent ≤ qualified workers

##### **AI-Powered Features** ✅
- **Natural Language Search**: "Priority 5 clients with task T1"
- **AI Corrections**: One-click fixes with batch apply
- **AI Recommendations**: Pattern-based business rule suggestions
- **Natural Language Data Modification**: "Change all priority 1 to priority 2"

#### **Milestone 2: Business Rules & Prioritization**

##### **Business Rules Engine** ✅
- **6 Rule Types**: Co-run, Slot Restriction, Load Limit, Phase Window, Pattern Match, Precedence Override
- **Natural Language Rule Creation**: "Tasks A and B must run together"
- **Rule Validation**: Real-time validation with error highlighting
- **Rule Templates**: Pre-built templates for common scenarios
- **Rule Management**: Create, edit, enable/disable, delete rules

##### **Prioritization System** ✅
- **Weight Sliders**: Interactive sliders for fulfillment, fairness, efficiency, cost, quality
- **Drag-Drop Ranking**: Visual criteria prioritization
- **Pairwise Comparison Matrix**: AHP-style comparisons
- **Preset Profiles**: Maximize Fulfillment, Fair Distribution, Optimize Efficiency, etc.
- **Real-time Preview**: Instant visualization of priority changes

#### **Milestone 3: Export & Integration**

##### **Export System** ✅
- **Multiple Formats**: CSV, JSON, XLSX with custom configurations
- **Validation Summary**: Export validation results and fixes
- **Business Rules Export**: Package rules for downstream tools
- **Bulk Export**: Export all entities with custom filters
- **Download Manager**: Progress tracking and error handling

### 🎯 **AI ENHANCEMENTS IMPLEMENTED**

#### **Advanced Pattern Detection** ✅
- **Co-occurrence Analysis**: Finds frequently requested task combinations
- **Skill Bottleneck Detection**: Identifies over-demanded skills
- **Phase Conflict Analysis**: Detects capacity vs demand mismatches
- **Workload Imbalance Detection**: Finds overloaded workers
- **Priority Conflict Detection**: Identifies high-priority vs capacity issues

#### **Intelligent Recommendations** ✅
- **Contextual Rule Suggestions**: Based on data patterns
- **Load Protection Rules**: Prevent worker overloading
- **Skill-Based Allocation**: Address skill gaps
- **Phase Optimization**: Resolve scheduling conflicts
- **Priority Management**: Establish precedence rules

#### **Natural Language Processing** ✅
- **Query Parsing**: Numeric comparisons, AND/OR logic, array inclusion
- **Code Generation**: Safe JavaScript for data modifications
- **Preview System**: Show changes before applying
- **Error Handling**: Graceful fallbacks and validation

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── ai/           # AI-powered endpoints
│   │   ├── upload/       # File upload handling
│   │   ├── validate/     # Validation engine
│   │   └── export/       # Export functionality
│   ├── data/             # Data management pages
│   ├── rules/            # Business rules interface
│   ├── priorities/       # Prioritization system
│   └── export/           # Export dashboard
├── components/           # React components
│   ├── ai/              # AI-powered components
│   ├── data-grid/       # Data table components
│   ├── validation/      # Validation UI
│   ├── rules/           # Business rules UI
│   └── priorities/      # Prioritization UI
├── lib/                 # Core libraries
│   ├── ai/              # AI integration
│   ├── parsers/         # CSV/XLSX parsing
│   ├── validators/      # Validation engine
│   ├── rules/           # Business rules engine
│   └── export/          # Export utilities
├── store/               # Zustand state management
└── types/               # TypeScript definitions
```

## 🛠️ **Technology Stack**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Design System
- **State Management**: Zustand
- **AI Integration**: Google Gemini 1.5 Pro
- **File Processing**: Papa Parse, XLSX.js
- **Validation**: Custom validation engine
- **Testing**: Jest, React Testing Library

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+
- npm or yarn
- Google AI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd data-alchemist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Add your Google AI API key:
   ```
   GOOGLE_AI_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📊 **Sample Data**

The project includes comprehensive sample data for testing:

### **Basic Samples** (`samples/basic/`)
- `clients.csv`: 10 clients with various priorities and task requests
- `workers.csv`: 15 workers with diverse skills and availability
- `tasks.csv`: 15 tasks with different complexity levels

### **Edge Cases** (`samples/edge-cases/`)
- `clients-with-errors.csv`: Intentional validation errors
- `workers-invalid.csv`: Invalid worker data scenarios
- `tasks-circular.csv`: Circular dependency examples

### **Complex Scenarios** (`samples/complex/`)
- Large datasets for performance testing
- Complex business rule scenarios
- Advanced validation patterns

## 🎯 **Usage Guide**

### **1. Data Upload**
1. Navigate to `/upload`
2. Drag and drop CSV/XLSX files
3. AI automatically maps headers
4. Real-time validation runs immediately

### **2. Data Management**
1. View data at `/data/clients`, `/data/workers`, `/data/tasks`
2. Use natural language search: "Priority 5 clients"
3. Enable AI features for corrections and recommendations
4. Use natural language modifier: "Change all priority 1 to priority 2"

### **3. Business Rules**
1. Go to `/rules`
2. Create rules using natural language: "Tasks A and B must run together"
3. Or use the visual rule builder
4. Apply AI recommendations for optimization

### **4. Prioritization**
1. Navigate to `/priorities`
2. Use weight sliders or drag-drop ranking
3. Apply preset profiles for common scenarios
4. Preview changes in real-time

### **5. Export**
1. Visit `/export`
2. Select entities and formats
3. Include validation summary and business rules
4. Download clean, validated data package

## 🔧 **AI Features Deep Dive**

### **Natural Language Search**
```typescript
// Examples of supported queries:
"Priority 5 clients"                    // PriorityLevel = 5
"clients with task T001"                // RequestedTaskIDs includes T001
"PriorityLevel > 3 and with task T002"  // Complex AND logic
"Priority 5 or Priority 4"              // OR logic
```

### **AI Corrections**
- **One-click Fixes**: Apply individual corrections
- **Batch Operations**: Select multiple corrections
- **Preview System**: See changes before applying
- **Validation Integration**: Automatic re-validation

### **Pattern Detection**
- **Co-run Candidates**: Frequently requested together
- **Skill Bottlenecks**: Over-demanded skills
- **Phase Conflicts**: Capacity vs demand mismatches
- **Workload Imbalances**: Overloaded workers

### **Natural Language Modification**
```typescript
// Examples of supported modifications:
"Change all priority 1 clients to priority 2"
"Set MaxLoadPerPhase to 3 for all workers"
"Increase duration by 1 for all tasks"
"Add skill 'JavaScript' to all workers"
```

## 🧪 **Testing**

### **Run Tests**
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### **Test Structure**
- **Unit Tests**: Core validation and business logic
- **Integration Tests**: API endpoints and data flow
- **Component Tests**: UI components and interactions
- **E2E Tests**: Complete user workflows

## 📈 **Performance**

### **Optimizations**
- **Lazy Loading**: Components and data loaded on demand
- **Virtual Scrolling**: Large datasets handled efficiently
- **Debounced Search**: Optimized natural language queries
- **Caching**: AI responses and validation results cached
- **Batch Operations**: Efficient bulk data processing

### **Scalability**
- **Modular Architecture**: Easy to extend and maintain
- **Type Safety**: Full TypeScript coverage
- **Error Boundaries**: Graceful error handling
- **Progressive Enhancement**: Works without AI features

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write comprehensive tests
- Document new features
- Follow the existing code structure

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Google AI for Gemini capabilities
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first styling
- The open-source community for various dependencies

---

**Data Alchemist** - Transform your data with AI-powered insights! 🧪✨