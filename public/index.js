const btnSend = document.getElementById("btnSend");
const btnClear = document.getElementById("btnClear");
const txtPromptInput = document.getElementById("txtPromptInput");
const lstResults = document.getElementById("lstResults");

btnSend.addEventListener("click", sendToChatGPT);
btnClear.addEventListener("click", clearAll);

function sendToChatGPT() {
  let prompt = txtPromptInput.value.trim();

  if (!prompt) {
    return;
  }

  // Mostrar mensaje de carga
  lstResults.innerHTML += '<li class="list-group-item">Enviando mensaje...</li>';

  fetch('/api', {
    method: "POST",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    headers: {
      "Content-Type": "application/json",   
    },
    body: JSON.stringify({ "prompt": prompt }),
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Error en la solicitud al servidor");
      }
      return response.json();
    })
    .then(data => {
      const messageContent = replaceBackticksWithPre(data.message.content);
      const listItem = createListItem(prompt, messageContent);  
      lstResults.appendChild(listItem);
      txtPromptInput.value = ""; // Limpiar el área de texto después de enviar el mensaje
    })
    .catch(error => {
      console.error("Error:", error);
      lstResults.innerHTML += '<li class="list-group-item text-danger">Error al enviar mensaje</li>';
    });
}

function createListItem(prompt, message) {
  const listItem = document.createElement("li");
  listItem.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-start");
  listItem.innerHTML = `
    <div class="ms-2 me-auto">
      <div class="fw-bold">${prompt}</div>
      <p>${message}</p>
    </div>`;
  return listItem;
}

function replaceBackticksWithPre(string) {
  const regex = /```([\s\S]*?)```/g;
  const response = string.replace(regex, "<pre>$1</pre>");
  return response;
}

function clearAll() {
  lstResults.innerHTML = "";
  txtPromptInput.value = "";
}


