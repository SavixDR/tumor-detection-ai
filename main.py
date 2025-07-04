import numpy as np
import pandas as pd
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from keras.models import load_model, Model
from PIL import Image
from io import BytesIO
from sklearn.metrics.pairwise import cosine_similarity
from lime import lime_image
from skimage.segmentation import mark_boundaries
from scipy.stats import entropy
import cv2
import matplotlib.pyplot as plt
import uvicorn
import base64
import os

# === Load Model and Supporting Data ===
model = load_model("./models/my_cnn_model_4.h5")
feature_model = Model(inputs=model.input, outputs=model.layers[-3].output)

train_embeddings = np.load('notumor_embeddings.npy')
df = pd.read_csv('notumor_paths.csv')
train_paths = df['path'].tolist()
train_labels = df['label'].tolist()

class_names = ['glioma', 'meningioma', 'pituitary', 'notumor']

# === FastAPI App ===
app = FastAPI()

# === Utility Functions ===
def preprocess_input(img):
    arr = np.array(img.resize((299, 299)).convert('RGB')) / 255.0
    return (arr - 0.5) / 0.5

def preprocess_image(img):
    return np.array(img.resize((299, 299)).convert('RGB')) / 255.0

def predict_fn(images):
    return model.predict(np.array(images))

def explain_lime(image_arr):
    explainer = lime_image.LimeImageExplainer()
    explanation = explainer.explain_instance(
        image=image_arr,
        classifier_fn=predict_fn,
        top_labels=1,
        num_samples=1000,
        hide_color=0
    )
    temp, mask = explanation.get_image_and_mask(
        label=explanation.top_labels[0],
        positive_only=True,
        hide_rest=False
    )
    overlay = mark_boundaries(temp, mask)
    return overlay

def find_counterfactuals(img_arr, true_class, top_k=4):
    img_tensor = np.expand_dims(img_arr, axis=0)
    test_emb = feature_model.predict(img_tensor, verbose=0)
    sims = cosine_similarity(test_emb, train_embeddings)[0]
    sorted_idx = np.argsort(-sims)
    cf_paths = []
    for idx in sorted_idx:
        if train_labels[idx] != true_class:
            cf_paths.append(train_paths[idx])
        if len(cf_paths) == top_k:
            break
    return cf_paths

def image_to_base64(img_arr):
    img = Image.fromarray((img_arr * 255).astype(np.uint8))
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")


# === Uncertainty Prediction Functions ===
# Load ensemble models
def load_ensemble(models_dir, count=5):
    return [load_model(f"{models_dir}/ensemble_model_{i}.h5") for i in range(1, count + 1)]

ensemble_models = load_ensemble("./models", count=5)

# Preprocess image
def preprocess_image_ensemble(pil_image, target_size=(299, 299)):
    img_array = np.array(pil_image.convert("RGB"))
    img_resized = cv2.resize(img_array, target_size)
    img_normalized = img_resized.astype("float32") / 255.0

    return np.expand_dims(img_normalized, axis=0)

# Ensemble uncertainty prediction
def ensemble_predict(models, img_tensor):
    preds = np.array([model.predict(img_tensor)[0] for model in models])  # (n_models, num_classes)
    mean_pred = np.mean(preds, axis=0)
    var_pred = np.var(preds, axis=0)
    pred_entropy = entropy(mean_pred)
    
    return {
        "mean": mean_pred,
        "variance": var_pred,
        "entropy": pred_entropy,
        "class": np.argmax(mean_pred)
    }

# === API Endpoint ===
@app.get("/")
def root():
    return {"message": "Tumor-Detection Model API is running!"}

@app.post("/explain")
async def explain(file: UploadFile = File(...)):
    # XAI
    image = Image.open(BytesIO(await file.read()))
    img_arr = preprocess_input(image)
    lime_overlay = explain_lime(preprocess_image(image))
    lime_encoded = image_to_base64(lime_overlay)

    predicted_class = class_names[np.argmax(predict_fn([img_arr])[0])]
    cf_paths = find_counterfactuals(img_arr, true_class=predicted_class)
    cf_imgs = []
    for path in cf_paths:
        cf_img = Image.open(path).resize((299, 299)).convert('RGB')
        cf_encoded = image_to_base64(np.array(cf_img) / 255.0)
        cf_imgs.append(cf_encoded)

    # Uncertainty
    img = preprocess_image_ensemble(image)
    uncertainty_result = ensemble_predict(ensemble_models, img)

    return JSONResponse({
        "predicted_class": predicted_class,
        "predicted_class_ensemble": class_names[uncertainty_result["class"]],
        "entropy": float(uncertainty_result["entropy"]),
        "variance": float(np.mean(uncertainty_result["variance"])),
        "num_counterfactuals": len(cf_imgs),
        "lime_explanation": lime_encoded,
        "counterfactuals": cf_imgs,
    })

# # === Local run ===
# if _name_ == "_main_":
#     uvicorn.run("xai_api:app", host="0.0.0.0", port=8000, reload=True)