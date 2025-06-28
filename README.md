# Data Alchemist

A modern, AI-powered data management platform for resource allocation, validation, and business rule configuration.

## 🚀 Features
- **CSV/XLSX Upload** for Clients, Workers, and Tasks
- **Modern UI** with beautiful cards, gradients, and responsive design
- **Data Grid** with inline editing, search, and filtering
- **Natural Language Search** (e.g., "priority 5", "with task T1")
- **Comprehensive Validation** (missing columns, duplicate IDs, malformed lists, out-of-range values, broken JSON, unknown references, overloaded workers, skill coverage, and more)
- **Cell-level Error Highlighting** and validation summary
- **Business Rule UI** for co-run, slot-restriction, load-limit, phase-window, pattern-match, and precedence override rules
- **Prioritization & Weights**: sliders, drag-and-drop, pairwise comparison, and preset profiles
- **Export Clean Data & Rules** as CSV, Excel, or JSON
- **AI-Ready**: Easily extendable for AI-powered rule recommendations, error correction, and more

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
```sh
npm install
```

### Running Locally
```sh
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

### Building for Production
```sh
npm run build
npm start
```

## 📁 Project Structure
- `src/app/` — Main Next.js app pages (upload, data, rules, priorities, export, etc.)
- `src/components/` — UI components (data grid, cards, forms, validation, etc.)
- `src/lib/` — Parsers, validators, and utility functions
- `src/store/` — Zustand state management
- `src/types/` — TypeScript types for all entities
- `samples/` — Sample CSV files for testing

## 👤 Author
- [Monil110](https://github.com/Monil110)

---

_This project is a showcase of modern data management, validation, and rule configuration with a beautiful, user-friendly interface._