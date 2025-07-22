//Obtenemos el año actual
const currentYear = new Date().getFullYear();
//Establecemos el año en el span con id="current-year"
document.getElementById('current-year').textContent = currentYear;


//CODIGO PARA SCROLL DE LAS IMAGENES EN EL CARRUSEL
let indice = 0;

function cambiarImagen(direccion) {
  const imagenes = document.querySelectorAll('.carrusel-imagen');
  const totalImagenes = imagenes.length;

  indice += direccion;

  if (indice < 0) {
    indice = totalImagenes - 1;
  } else if (indice >= totalImagenes) {
    indice = 0;
  }
  // Movimiento del carrusel
  const carrusel = document.querySelector('.carrusel');
  carrusel.style.transform = `translateX(-${indice * 43.2}%)`; // Ajustado a 43.2% para el desplazamiento completo
}
// Función para el movimiento automático del carrusel
function movimientoAutomatico() {
  cambiarImagen(1); // Mueve a la siguiente imagen
}
// Inicia el movimiento automático cada 2.5 segundos (2500 ms)
const intervalo = setInterval(movimientoAutomatico, 2500);
// Agregar eventos a los botones de anterior y siguiente
document.querySelector('.prev').addEventListener('click', () => {
  clearInterval(intervalo); // Detener el movimiento automático cuando el usuario interactúa
  cambiarImagen(-1); // Retroceder una imagen
});
document.querySelector('.next').addEventListener('click', () => {
  clearInterval(intervalo); // Detener el movimiento automático cuando el usuario interactúa
  cambiarImagen(1); // Avanzar una imagen
});


//CODIGO PARA FILTRAR PRODUCTOS EN EL PRODUCT-LIST
// Función para filtrar productos según la categoría seleccionada
function filterProducts(category) {
  const products = document.querySelectorAll('.product-item');
  // Si la categoría es 'all', mostramos todos los productos
  if (category === 'all') {
    products.forEach(product => {
      product.style.display = 'block';
    });
  } else {
    // Si no, mostramos solo los productos de la categoría seleccionada
    products.forEach(product => {
      if (product.getAttribute('data-category') === category) {
        product.style.display = 'block';
      } else {
        product.style.display = 'none';
      }
    });
  }
}


//codigo para ChatBot
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const userInput = document.getElementById('user-input');
  const sendButton = document.getElementById('send-button');

  // Función para agregar un mensaje al chat
  function addMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (sender === 'user') {
      messageElement.classList.add('user-message');
    } else {
      messageElement.classList.add('bot-message');
    }
    messageElement.textContent = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll al último mensaje
  }

  // Función para enviar el mensaje al backend y obtener la respuesta
  async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    addMessage('user', message);
    userInput.value = ''; // Limpiar el input

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: message })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      addMessage('bot', data.response);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      addMessage('bot', 'Lo siento, hubo un error al procesar tu solicitud.');
    }
  }

  // Event listeners
  sendButton.addEventListener('click', sendMessage);

  userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  // Mensaje de bienvenida inicial del bot
  addMessage('bot', '¡Hola! Soy tu asistente. ¿En qué puedo ayudarte hoy?');
});

//codigo para minimizar el chatbot 
// Espera a que el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  const minimizeBtn = document.getElementById("minimize-btn");
  const chatContainer = document.querySelector(".chat-container");

  minimizeBtn.addEventListener("click", function () {
    chatContainer.classList.toggle("minimized");

    // Cambia el texto del botón (opcional)
    if (chatContainer.classList.contains("minimized")) {
      minimizeBtn.textContent = "⬆"; // o cualquier ícono para "expandir"
    } else {
      minimizeBtn.textContent = "x"; // o el ícono para "cerrar"
    }
  });
});
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.querySelector('.chat-container').classList.add('visible');
  }, 2000); //2 segundos
});
