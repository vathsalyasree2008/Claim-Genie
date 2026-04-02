# ClaimGenie 

> AI-Driven Claim & Document Generation Platform

ClaimGenie helps users generate formal legal documents — insurance claims, refund requests, complaint letters, incident reports, and professional statements — instantly.

---

## Project Structure

```
claimgenie/
├── frontend/
│   └── index.html          # Full frontend (single-page)
├── backend/
│   ├── main.py             # FastAPI backend
│   └── requirements.txt    # Python dependencies
├── .gitignore
└── README.md
```

---

## Running Locally

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/claimgenie.git
cd claimgenie
```

### 2. Set up the backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the server
```bash
uvicorn main:app --reload
```

Server runs at: `http://127.0.0.1:8000`

### 4. Open the frontend
Open `frontend/index.html` in your browser **or** visit `http://127.0.0.1:8000` to serve it via FastAPI.

---

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/` | Serves the frontend |
| `GET`  | `/api/health` | Health check |
| `GET`  | `/api/doc-types` | List supported document types |
| `POST` | `/api/generate` | Generate a document |

### POST `/api/generate`

**Request Body:**
```json
{
  "doc_type": "insurance",
  "name": "Vathsalya Sree",
  "subject": "Vehicle Damage",
  "description": "My car was damaged in a flood on the night of 12th June.",
  "incident_date": "2025-06-12"
}
```

**Supported `doc_type` values:** `insurance` | `refund` | `complaint` | `report` | `statement`

**Response:**
```json
{
  "reference_no": "CG-INS-482910",
  "doc_type": "insurance",
  "content": "INSURANCE CLAIM DOCUMENT\n...",
  "generated_at": "2025-06-15T10:30:00"
}
```

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JS |
| Backend | Python, FastAPI |
| Server | Uvicorn |

---

##  Deployment

You can deploy this on:
- **Render** — push to GitHub, connect repo, set start command: `uvicorn backend.main:app --host 0.0.0.0 --port 10000`
- **Railway** — auto-detects Python projects
- **Vercel** (frontend only) — just deploy `frontend/index.html`

---

## 👩‍💻 Author

Built by **Vathsalya Sree** | B.Tech CSE @ MRECW, Hyderabad
