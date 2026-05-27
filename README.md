# LeadFlow CRM



https://github.com/user-attachments/assets/e755f85e-a639-4b78-a9d1-bee19f33c8c4


An enterprise-grade, single-page Lead Management CRM built to track potential customers moving through a sales pipeline. This application features a high-fidelity tabular overview, a dynamic drag-and-drop Kanban board, strict server-contract status workflows, deep-linkable navigation, and robust runtime state handling.
## Technical Architecture & Justifications
 * **Runtime Environment:** **Node.js** managed environment utilizing strict package isolation.
 * **Core UI Library:** **React 18** with **TypeScript (v5)**. TypeScript models enforce zero-any type constraints on critical data schemas.
 * **Routing Engine:** **React Router DOM (v6)** for declarative, nested navigation layout matching.
 * **Drag-and-Drop Interaction Engine:** **@dnd-kit/core** & **@dnd-kit/utilities**. Chosen over legacy alternatives due to its modular, lightweight bundle profile, reliance on native semantic positioning, and superior accessibility structure.
 * **Styling Architecture:** **Vanilla CSS3 Modules** and custom global styling sheets using the premium **Inter** font family. Avoided utility component bloat (e.g., Tailwind, Shadcn) to maintain a zero-dependency footprint and optimize paint/layout cycles on high-density displays.
 * **Mock Backend Service:** **JSON-Server** running locally on Node.js to expose standard REST API endpoints (GET, POST, PUT, DELETE).
## System Capabilities
### 1. Advanced Core CRUD Lifecycle
 * **List Layout:** High-fidelity tabular dashboard tracking Lead names, validated emails, creation dates, source pathways, and dynamic status badges.
 * **Search & Filtering System:** Instantly filters active data models across user names or emails via an internal regex search matrix.
 * **State-Driven Forms:** Features custom asynchronous modals for lead generation and profile editing.
### 2. State-Machine Status Transitions
The UI strictly models the directional state flow defined in the project constraints:

 * **Visual Hard-Locks:** Once a lead enters terminal stages (CONVERTED or LOST), select boxes and interactive dropdown options are dropped automatically in favor of non-editable status pills.
 * **Transition Boundaries:** Only legal next-step status variations are rendered inside active dropdown lists.
### 3. Deep-Linkable Routing State
 * **URL Parameter Syncing:** Active string parameters like ?search= and ?status= are mirrored into the browser URL. Navigating away or executing hard page refreshes preserves the exact view state.
 * **Deep Linking Directives:** Accessing paths such as /leads/:id/edit handles deep verification on the existing in-memory database arrays to launch contextual views directly on target nodes.
### 4. Drag-and-Drop Pipeline View (Level 2)
 * **Optimistic Render Updating:** Dragging cards updates local state collections instantly to simulate sub-100ms response velocities.
 * **Automatic Rollback Strategy:** Network delays or error callbacks triggered from backend rejections gracefully restore cards to historical coordinates.
 * **Constraint Collision Handlers:** Illegal drop targets trigger collision warnings via native snap-backs and block arbitrary out-of-order network calls.
### 5. Validation Handling & Status Flags
 * **Asynchronous UI Locks:** Submit buttons remain programmatically disabled if form states are invalid or if a network transaction is currently inflight (isSubmitting).
 * **On-Blur Regex Validation:** Email formats are passed through standard validation blocks (/^[^\s@]+@[^\s@]+\.[^\s@]+$/). Form control lines highlight into warning states (#ef4444) only upon blurring, preserving a distraction-free data entry experience.
 * **Explicit Edge States:** Dedicated render blocks for loading wheels, server failure notices (400/500 error blocks), and zero-state index views are completely implemented.

## Installation & Local Execution
### Prerequisites
 * Node.js (v18.0.0 or higher)
 * npm (v9.0.0 or higher)
### Step 1: Install Package Dependencies
Restore project dependencies specified in the manifest structure:
```bash
npm install

```
### Step 2: Launch Backend Server Engine
Boot the local JSON server on its designated testing port (Port 4000):
```bash
npx json-server --watch seed.json --port 4000

```
### Step 3: Launch Local Development Workspace
Execute the Vite compiler engine to launch the single-page application locally:
```bash
npm run dev

```
Open your local address (typically http://localhost:5173 or http://localhost:5174) in your browser to interact with the system.
