import numpy as np
from keras.models import load_model
import cv2
import matplotlib.pyplot as plt
from scipy.stats import entropy

# Load ensemble models
def load_ensemble(models_dir, count=5):
    return [load_model(f"{models_dir}/ensemble_model_{i}.h5") for i in range(1, count + 1)]

# Preprocess image
def preprocess_image(img_path, target_size=(299, 299)):
    img = cv2.imread(img_path)
    img = cv2.resize(img, target_size)
    img = img.astype("float32") / 255.0
    return np.expand_dims(img, axis=0)

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
classes = ['glioma', 'meningioma', 'pituitary', 'notumor']

# Example usage
models = load_ensemble("/kaggle/input/ensemble_models/tensorflow2/default/1", count=5)
img = preprocess_image("/kaggle/input/brain-tumor-mri-dataset/Testing/meningioma/Te-me_0025.jpg")
result = ensemble_predict(models, img)

# Display results
print("Predicted class:", classes[result["class"]])
print("Entropy:", result["entropy"])
print("Variance (mean):", np.mean(result["variance"]))

# Optional: plot
plt.bar(['glioma', 'meningioma', 'pituitary', 'no tumor'], result["mean"])
plt.title("Class Probability Distribution")
plt.ylabel("Probability")
plt.show()