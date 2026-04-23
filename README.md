# MicroID Lab Guide

**A Mobile-First Progressive Web Application for Guided Unknown Bacterial Identification**

Bio 431: Operational Microbiology | United States Air Force Academy
Department of Biology

---

## Overview

MicroID Lab Guide is a free, open-source progressive web application (PWA) designed to guide undergraduate students through the systematic identification of unknown bacterial isolates. Originally developed for USAFA's Bio 431 (Microbiology) unknown identification lab, the app replaces paper-based data sheets with a structured, mobile-friendly digital workflow that enforces proper microbiological reasoning at each decision point.

The application runs entirely in the browser with no backend server, no user accounts, and no data collection. All student data remains on-device in local storage, with optional JSON backup/restore for multi-session lab work.

---

## Pedagogical Context

In the unknown identification lab, cadets receive an unknown bacterial culture embedded within a fictional operational incident scenario (e.g., contaminated water supply at a deployed location, biofilm on aircraft fuel bladder surfaces). Students must identify the organism using classical microbiological techniques (Gram staining, selective/differential media, biochemical tests) and produce a Commander's Risk Assessment Memo communicating the threat to a non-technical audience.

MicroID Lab Guide supports this exercise by:

1. **Enforcing a logical identification workflow** -- students cannot skip ahead without recording observations at each phase
2. **Providing real-time differential narrowing** -- a decision engine eliminates candidate organisms as test results are recorded, making the diagnostic reasoning process visible
3. **Scaffolding test interpretation** -- guided step-by-step interpretation modals walk students through multi-observation tests (e.g., KIA slant/butt/gas/H2S, fermentation acid/gas production) before deriving results
4. **Integrating photo documentation** -- students capture images of Gram stains, colony morphology, and individual test results directly from their phone cameras
5. **Generating formatted deliverables** -- printable identification data sheets and Commander's Risk Assessment Memos are produced directly from recorded data

---

## Application Architecture

### Four-Phase Identification Workflow

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Initial Observations | Gram stain (reaction, shape, arrangement), endospore stain, acid-fast stain, colony morphology, photo documentation |
| 2 | Flowchart Routing | Automated routing to the appropriate diagnostic branch based on Gram reaction and cell shape (e.g., Gram-positive cocci, Gram-negative rods) |
| 3 | Biochemical Testing | Test selection from a prioritized list (ranked by discrimination value), result recording with guided interpretation, photo upload per test |
| 4 | Final Identification | Organism selection from remaining candidates, automated sanity check against recorded results, confidence assessment |

### Decision Engine

The app includes a rule-based differential elimination engine that operates against a database of 37 organisms commonly encountered in clinical and environmental microbiology courses. The engine:

- Filters organisms by Gram reaction and cell shape after Phase 1
- Eliminates candidates whose expected test results conflict with observed results after each Phase 3 entry
- Ranks remaining available tests by discrimination value (information gain) to guide efficient test selection
- Runs a sanity check at Phase 4 that flags any recorded results inconsistent with the proposed identification

### Guided Interpretation Modals

Certain biochemical tests require students to make multiple sequential observations before arriving at a result. The app provides step-by-step interpretation wizards for:

- **KIA (Kligler's Iron Agar)**: 4-step compound observation (slant color, butt color, gas production, H2S production)
- **Fermentation tests** (10 sugars): 2-step observation (acid production, gas production)
- **Nitrate Reduction**: 2-step conditional (initial color after reagent, zinc dust confirmation if negative)
- **Hemolysis**: 1-step direct classification (alpha/beta/gamma)

Each modal derives the final result from the student's observations, displays the underlying first-principle reasoning, and offers a "manual override" escape hatch for ambiguous results.

### Organism Database

The application includes profiles for 37 organisms across BSL-1 and BSL-2 classifications, each containing:

- Expected Gram stain and morphological characteristics
- Expected results for all available biochemical tests
- Clinical significance and disease associations
- Operational threat context (biodefense, food/water safety, nosocomial)
- BSL classification

### Reference Library

A searchable, categorized reference library provides protocol summaries for 67 staining techniques, selective/differential media, enzymatic tests, and antibiotic sensitivity tests. Each entry includes the procedure overview, positive/negative result descriptions, clinical significance, and the underlying biochemical principle.

---

## Technical Specification

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 19 | UI component architecture |
| Build Tool | Vite 6 | Development server and production bundler |
| Styling | Tailwind CSS 4 | Utility-first CSS framework |
| State Management | Zustand | Lightweight state with localStorage persistence |
| Routing | React Router 7 | Client-side SPA navigation |
| Icons | Lucide React | Consistent SVG icon set |
| Deployment | Static hosting (Netlify) | No backend required |

### Key Technical Characteristics

- **Progressive Web App (PWA)**: Installable to device home screen via Safari "Add to Home Screen" on iOS or Chrome install prompt on Android. Runs in standalone mode without browser chrome.
- **Offline-capable**: All application logic, organism data, and test references are bundled at build time. No network requests are made during use.
- **Mobile-first responsive design**: Designed for iPhone and Android phone screens (375px viewport). Fully functional on tablet and desktop.
- **Client-side only**: Zero backend dependencies. No server, no database, no API calls. All data stays on the student's device.
- **localStorage persistence**: Session state (all results, photos, notes) is persisted to browser localStorage via Zustand's persist middleware and survives app restarts.
- **Photo compression**: Camera uploads are compressed client-side via HTML5 Canvas (max 1200px width, JPEG at 75% quality) to keep each image under ~200KB, well within localStorage limits for a typical lab session.
- **Backup/restore**: Students can download their full session as a JSON file and restore it on a different device or after browser data is cleared.
- **Dark mode**: Supports system-level dark mode preference with manual toggle.
- **Production bundle**: ~460KB JavaScript + ~47KB CSS (gzipped: ~130KB + ~9KB). No external CDN dependencies at runtime.

### File Structure

```
src/
  components/
    Dashboard.jsx              # Investigation overview + backup/restore
    DataSheet.jsx              # Live identification data sheet view
    ExportView.jsx             # Print-to-PDF data sheet + Commander's memo
    PhotoGallery.jsx           # Lab photo log + reference gallery
    ReferenceLibrary.jsx       # Searchable test/media/stain reference
    incident/
      IncidentForm.jsx         # New investigation intake form
    layout/
      Header.jsx               # App header + Start Over button
      TabBar.jsx               # 6-tab bottom navigation
    shared/
      Badge.jsx, Card.jsx, Modal.jsx, ErrorBoundary.jsx
    workflow/
      WorkflowContainer.jsx    # Phase state machine + stepper
      Phase1Initial.jsx        # Gram stain + morphology + photo upload
      Phase2Flowchart.jsx      # Diagnostic branch routing
      Phase3Biochemical.jsx    # Test cards + guided interpretation
      Phase4FinalId.jsx        # Organism selection + sanity check
      InterpretationModal.jsx  # Step-by-step result derivation wizard
  data/
    organisms.js               # 37 organism profiles
    tests.js                   # 67 test/media/stain definitions
    flowcharts.js              # Diagnostic branching logic
  stores/
    useSessionStore.js         # Zustand session state (persisted)
    useAppStore.js             # App preferences (dark mode)
  utils/
    decisionEngine.js          # Elimination, ranking, sanity check
    photoUtils.js              # Camera image compression
```

---

## Export Outputs

### Identification Data Sheet (Print to PDF)

A formatted data sheet containing:
- Cadet name, lab section, culture number, date
- Incident scenario and sample metadata
- Final organism identification and BSL level
- Morphological characteristics (Gram stain, arrangement, colony morphology)
- All biochemical/physiological test results with dates
- Lab photo documentation grid (embedded as base64 images)

### Commander's Risk Assessment Memo

A formatted military memorandum template containing:
- Incident context (auto-populated from scenario)
- Organism identification and BSL level (auto-populated)
- Evidence summary of key test results (auto-populated)
- Operational Threat Assessment (cadet-authored free text)
- Recommended Countermeasures (cadet-authored free text)
- Signature block

---

## Deployment

MicroID Lab Guide is deployed as a static site. The production build (`npm run build`) produces a `dist/` folder that can be hosted on any static hosting provider:

- **Netlify** (recommended): Drag-and-drop `dist/` folder. Includes `_redirects` file for SPA route handling.
- **GitHub Pages**: Push `dist/` contents to a `gh-pages` branch.
- **Any web server**: Serve `dist/index.html` for all routes (SPA fallback).

No environment variables, API keys, or server configuration required.

### Student Installation (PWA)

1. Open the hosted URL in Safari (iOS) or Chrome (Android)
2. Tap Share > "Add to Home Screen"
3. The app appears on the home screen and opens in standalone mode

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone <repository-url>
cd bio-431-app
npm install
npm run dev      # Development server at http://localhost:5173
npm run build    # Production build to dist/
```

---

## Course Integration

MicroID Lab Guide was developed for use in USAFA's Bio 431: Operational Microbiology course, specifically supporting the unknown bacterial identification lab. The application is designed to be:

- **Drop-in compatible** with existing unknown identification learning objectives
- **Supplementary, not replacement** -- the app guides workflow and captures data but does not replace hands-on laboratory technique, microscopy, or instructor evaluation
- **Customizable** -- the organism database, test definitions, and incident scenarios can be modified in the source `data/` files to support different course configurations or organism panels
- **Zero-cost** -- no licensing fees, subscriptions, or per-student charges

---

## License

This project is open source and available for educational use.

---

## Contact

Lt Col Michael Barnhart
Department of Biology
United States Air Force Academy
USAFA, CO 80840
