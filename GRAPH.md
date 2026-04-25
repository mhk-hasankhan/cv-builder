# Project Graph

```mermaid
flowchart LR
  Root[package.json]

  subgraph Frontend[frontend/src]
    Main[main.jsx]
    App[App.jsx]
    Layout[components/ui/Layout.jsx]
    Dashboard[pages/Dashboard.jsx]
    CVBuilder[pages/CVBuilder.jsx]
    CLBuilder[pages/CoverLetterBuilder.jsx]
    SharedCV[pages/SharedCV.jsx]
    CVStore[store/cvStore.js]
    CLStore[store/clStore.js]
    API[utils/api.js]
    Templates[templates/index.jsx]
    UI[components/ui/*]
    Sections[components/builder/*]
  end

  subgraph Backend[backend/]
    Server[server.js]
    DB[database/db.js]
    CVS[controllers/cvsController.js]
    CLS[controllers/coverLettersController.js]
    Export[controllers/exportController.js]
    CVSRoute[routes/cvs.js]
    CLRoute[routes/coverLetters.js]
    ExportRoute[routes/export.js]
    ShareRoute[routes/share.js]
    UploadRoute[routes/upload.js]
  end

  Root --> Main
  Root --> Server

  Main --> App
  App --> Layout
  App --> Dashboard
  App --> CVBuilder
  App --> CLBuilder
  App --> SharedCV

  Dashboard --> API
  CVBuilder --> CVStore
  CVBuilder --> Templates
  CVBuilder --> UI
  CVBuilder --> Sections
  CLBuilder --> CLStore
  CLBuilder --> UI
  SharedCV --> Templates
  SharedCV --> API

  CVStore --> API
  CLStore --> API
  API --> CVSRoute
  API --> CLRoute
  API --> ExportRoute
  API --> ShareRoute
  API --> UploadRoute

  Server --> DB
  Server --> CVSRoute
  Server --> CLRoute
  Server --> ExportRoute
  Server --> ShareRoute
  Server --> UploadRoute

  CVSRoute --> CVS
  CLRoute --> CLS
  ExportRoute --> Export
  ShareRoute --> DB
  UploadRoute --> DB

  Templates -->|renders| Modern[ModernTemplate.jsx]
  Templates -->|renders| Classic[ClassicTemplate.jsx]
  Templates -->|renders| Sidebar[SidebarTemplate.jsx]
```

## Summary

The repo is split into a React/Vite frontend and an Express/SQLite backend. The frontend routes through `App.jsx`, uses Zustand stores for CV and cover letter editing, and calls the API layer in `frontend/src/utils/api.js`. The backend mounts route modules in `server.js`, with controllers handling CV CRUD, cover letters, exports, sharing, and uploads.
