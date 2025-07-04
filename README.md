# Tumor detection model api

A FastAPI-based backend for predicting brain tumor types, generating LIME explanations, and estimating prediction uncertainty using an ensemble of models.

---

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

### 4. Download Required Data and Pretrained Models

#### Download Instructions:

- Inside the `data/` directory, open the file `download_link.txt` and follow the link to download the sample training data needed for XAI (`Training.zip`).
- Inside the `models/` directory, open the file `download_link.txt` and follow the link to download the pretrained model files (`Models.zip`).

#### Extracting the Files:

After downloading the zip files:

- For Training.zip:
    - Extract it inside the `data/` directory. The final structure should be:
        ```bash
        data/
        └── training/
            └── notumor/
                ├── Tr-noTr_0001.jpg
                ├── Tr-noTr_0002.jpg
                └── ... (1595 images total)
        ```

- For Models.zip:
    - Extract it inside the `models/` directory. The final structure should be:
        ```bash
        models/
        ├── my_cnn_model_4.h5
        ├── ensemble_model_1.h5
        ├── ensemble_model_2.h5
        ├── ensemble_model_3.h5
        ├── ensemble_model_4.h5
        └── ensemble_model_5.h5
        ```
✅ Make sure no extra nested folders are created during extraction.


### 5. Run FastAPI Server

```bash
uvicorn main:app --reload
```

Visit your backend at:
- 👉 http://127.0.0.1:8000