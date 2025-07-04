# Tumor detection model api

## ⚙️ Requirements

- Python 3.11+
- pip (for package management)

---

## 🚀 Local Setup Instructions

### 1. Clone the Repository and checkout to backend branch

```bash
git https://github.com/SavixDR/tumor-detection-ai.git
git checkout backend
cd tumor-detection-ai
```

### 2. Create a Virtual Environment

#### On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

#### On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run FastAPI Server

```bash
uvicorn main:app --reload
```

Visit your backend at:
- 👉 http://127.0.0.1:8000