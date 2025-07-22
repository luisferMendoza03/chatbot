import json
import random
import torch
from flask import Flask, render_template, request, jsonify
from sentence_transformers import SentenceTransformer, util
import numpy as np
import os # Importar os para obtener la ruta del directorio actual
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

print("Cargando modelo SentenceTransformer...")
try:
    model = SentenceTransformer('all-MiniLM-L6-v2')
    print("Modelo cargado exitosamente.")
except Exception as e:
    print(f"Error al cargar el modelo SentenceTransformer: {e}")
    print("Asegúrate de tener conexión a internet para descargar el modelo.")
    exit() # Salir si el modelo no se carga

# Cargar los datos del JSON
data_path = os.path.join(os.path.dirname(__file__), 'respuestas.json')
with open(data_path, 'r', encoding='utf-8') as f:
    intents = json.load(f)

# Pre-calcular embeddings para todos los patrones
# Esto se hace una sola vez al iniciar la aplicación
print("Calculando embeddings para los patrones de preguntas...")
patterns = []
responses_map = {} # Mapear patrones a sus respuestas
for intent in intents:
    for pattern in intent['patterns']:
        patterns.append(pattern)
        # Asocia cada patrón con las respuestas de su intent
        if pattern not in responses_map:
            responses_map[pattern] = []
        responses_map[pattern].extend(intent['responses'])

# Eliminar duplicados en responses_map si un patrón puede estar en múltiples intents con respuestas diferentes
for pattern, resps in responses_map.items():
    responses_map[pattern] = list(set(resps))


pattern_embeddings = model.encode(patterns, convert_to_tensor=True)
print("Embeddings calculados.")

def get_chatbot_response(user_message, threshold=0.7):
    user_message_embedding = model.encode(user_message, convert_to_tensor=True)

    # Calcular la similitud del coseno entre el mensaje del usuario y los patrones
    cosine_scores = util.cos_sim(user_message_embedding, pattern_embeddings)[0]

    # Encontrar la similitud máxima
    max_score = torch.max(cosine_scores).item()
    max_score_index = torch.argmax(cosine_scores).item()

    print(f"Mensaje del usuario: '{user_message}'")
    print(f"Patrón más similar: '{patterns[max_score_index]}' (Similitud: {max_score:.4f})")

    if max_score >= threshold:
        # Obtener el patrón más similar
        matched_pattern = patterns[max_score_index]
        # Devolver una respuesta aleatoria de las asociadas a ese patrón
        return random.choice(responses_map[matched_pattern])
    else:
        return "Lo siento, no entendí tu pregunta. ¿Podrías reformularla? O puedes contactarnos al número 55-5886-8403 o al correo ventas@alcaditrade.com.mx"

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/contacto')
def contacto():
    return render_template('contacto.html')
@app.route('/nosotros')
def nosotros():
    return render_template('nosotros.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify({'response': 'Mensaje vacío.'}), 400

    bot_response = get_chatbot_response(user_message)
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    # Asegúrate de que el modelo se haya cargado antes de ejecutar la aplicación
    # Se recomienda usar gunicorn o waitress para producción
    import torch # Importar torch aquí para evitar problemas de importación circular
    if 'model' in locals(): # Verificar si el modelo fue cargado
        app.run(debug=True)
    else:
        print("No se pudo iniciar la aplicación Flask porque el modelo no se cargó correctamente.")
        if __name__ == "__main__":
            app.run(host="0.0.0.0", port=10000)
