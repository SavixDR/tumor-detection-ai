# 🧠 Tumor Detection AI Project

This repository is a complete end-to-end solution for **Explainable Brain Tumor Detection with Uncertainty Estimation**, including:

- A detailed **Jupyter notebook** for training and evaluation.
- A **FastAPI backend** serving model predictions and explanations.
- A **React frontend** to upload images and visualize predictions.

---

## 📁 Repository Structure & Branches

This repository has **Three branches**, each serving a distinct part of the project:

### ✅ `main` (You're here!)
- Contains:
  - `advancedai-project_final.ipynb`: the **final Jupyter notebook** with full explanation of the project workflow.
  - `README.md`: this file with an overview of the entire project.
- Usage: Ideal if you want to **understand and reproduce the project from scratch** using the notebook.


### 🌐 `frontend`
- Contains:
  - A complete **React-based web interface** to upload images and view predictions.
  - UI components, routing, and API integration logic.\
- See `frontend/README.md` for setup and usage instructions.


### ⚙️ `backend`
- Contains:
  - FastAPI-based backend that serves prediction and explanation APIs.
- See `backend/README.md` for detailed setup and usage instructions.

---

## ⚠️ Special Note

To run the backend successfully, you **must download the required files**:

- Navigate to `data/download_link.txt` and `models/download_link.txt` in the `backend` branch.
- Follow the links to download the `.zip` files.
- Extract them to accordingly as mentioned in `backend/README.md` file.

Failure to download and extract these correctly will result in errors when starting the backend server.

---

## 📌 Recap Notes
- Each component (notebook, backend, frontend) is modular and can run independently.
- Refer to each branch’s `README.md` for more specific setup instructions.
- Ensure you’ve downloaded the correct data and model files for backend functionality.

---

Thanks for checking out the project! Feel free to explore each branch for more details.
