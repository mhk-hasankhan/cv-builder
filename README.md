# CV Builder || CV & Cover Letter App
LIVE: https://cv-builder-co.netlify.app/

A professional, locally-run CV and Cover Letter builder with real-time preview, multiple templates, PDF/DOCX export, and drag-and-drop section ordering.

## ✨ Features

- **Dashboard** — Manage multiple CVs and cover letters
- **3 CV Templates** — Modern, Classic, Sidebar (ATS-friendly options)
- **Real-time Preview** — Two-panel live preview as you type
- **Rich Text Editing** — Bold, italic, bullet lists via TipTap
- **Drag & Drop** — Reorder CV sections with @dnd-kit
- **All CV Sections** — Personal, Experience, Education, Skills, Projects, Certifications, Languages, Interests, Custom
- **Cover Letter Builder** — Full cover letter editor with live preview
- **Export PDF** — PDFKit-powered PDF generation
- **Export DOCX** — Word document export
- **Share Links** — Generate shareable read-only CV URLs
- **Auto-save** — Debounced auto-save every 1.2s
- **Photo Upload** — Profile picture support
- **Color Themes** — 8 presets + custom color picker
- **Font Selection** — DM Sans, Source Serif, Lora
- **Local SQLite DB** — No cloud dependencies
- **Print Support** — Browser print dialog

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both backend and frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

> Backend runs on port **3001**, frontend on **5173**.

## 📁 Project Structure

```
cv-builder/
├── package.json              # Root scripts (concurrently)
├── README.md
│
├── backend/
│   ├── server.js             # Express app entry point
│   ├── package.json
│   ├── database/
│   │   └── db.js             # SQLite initialization
│   ├── routes/
│   │   ├── cvs.js
│   │   ├── coverLetters.js
│   │   ├── export.js
│   │   ├── upload.js
│   │   └── share.js
│   ├── controllers/
│   │   ├── cvsController.js
│   │   ├── coverLettersController.js
│   │   └── exportController.js
│   └── uploads/              # Profile photos (auto-created)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── utils/
        │   └── api.js         # Axios API layer
        ├── store/
        │   ├── cvStore.js     # Zustand CV state
        │   └── clStore.js     # Zustand CL state
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── CVBuilder.jsx
        │   ├── CoverLetterBuilder.jsx
        │   └── SharedCV.jsx
        ├── components/
        │   ├── builder/
        │   │   ├── PersonalSection.jsx
        │   │   ├── ExperienceSection.jsx
        │   │   ├── EducationSection.jsx
        │   │   ├── SkillsSection.jsx
        │   │   ├── ProjectsSection.jsx
        │   │   ├── OtherSections.jsx
        │   │   └── SectionManager.jsx
        │   └── ui/
        │       ├── Layout.jsx
        │       ├── Elements.jsx
        │       └── RichTextEditor.jsx
        └── templates/
            ├── index.js       # Template registry
            ├── ModernTemplate.jsx
            ├── ClassicTemplate.jsx
            └── SidebarTemplate.jsx
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Frontend | React 18 + Vite |
| Styling | TailwindCSS |
| State | Zustand |
| Rich Text | TipTap |
| Drag & Drop | @dnd-kit |
| PDF Export | PDFKit |
| DOCX Export | docx npm package |
| Routing | React Router v6 |

## 📝 Adding New Templates

1. Create `frontend/src/templates/MyTemplate.jsx`
2. Export a default `memo` component accepting `{ cv }` prop
3. Register it in `frontend/src/templates/index.js`:

```js
import MyTemplate from './MyTemplate.jsx'

export const TEMPLATES = {
  // ... existing templates
  mytemplate: {
    id: 'mytemplate',
    name: 'My Template',
    description: 'Description here',
    component: MyTemplate,
    ats: true,
  },
}
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cvs | List all CVs |
| POST | /api/cvs | Create CV |
| GET | /api/cvs/:id | Get CV |
| PUT | /api/cvs/:id | Update CV |
| DELETE | /api/cvs/:id | Delete CV |
| POST | /api/cvs/:id/duplicate | Duplicate CV |
| GET | /api/cover-letters | List cover letters |
| POST | /api/cover-letters | Create cover letter |
| GET | /api/cover-letters/:id | Get cover letter |
| PUT | /api/cover-letters/:id | Update cover letter |
| DELETE | /api/cover-letters/:id | Delete cover letter |
| GET | /api/export/pdf/:id | Export CV as PDF |
| GET | /api/export/docx/:id | Export CV as DOCX |
| GET | /api/export/cover-letter/pdf/:id | Export CL as PDF |
| GET | /api/export/cover-letter/docx/:id | Export CL as DOCX |
| POST | /api/upload/photo | Upload profile photo |
| POST | /api/share/generate/:id | Generate share link |
| GET | /api/share/:token | Get shared CV |

## 🎨 Customization

- **Colors**: Edit `tailwind.config.js` or `src/index.css`
- **Fonts**: Add Google Fonts in `index.html`, update `FONT_OPTIONS` in `CVBuilder.jsx`
- **Sections**: Add to `SECTION_COMPONENTS` in `CVBuilder.jsx` and the store defaults

## 📦 Database

SQLite database is stored at `backend/database/cvbuilder.db`. This file is created automatically on first run. Back it up to preserve your CVs.

## 🖨 Print

Click the print button in the CV builder. The preview renders clean A4-sized output using `@media print` styles.
