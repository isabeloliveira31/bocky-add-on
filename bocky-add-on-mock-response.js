function abrirConversa() {
    document.getElementById('bocky-icon').classList.add('close');
    setTimeout(() => {
        resizeIframeToConversaBocky();
        document.getElementById('chatbot-conversa').classList.add('open');
        setTimeout(() => {
            resizeIframeToConversaBocky();
        }, 100);
    }, 150);
    document.getElementById('chatbot-widget-prompt').focus();
}

function esconderConversa() {
    document.getElementById('chatbot-conversa').classList.remove('open');
    window.parent.postMessage({ type: 'collapse-bocky'}, '*');
    document.getElementById('bocky-icon').classList.remove('close');
}

function chooseEngine(engine){
    if (engine == 'bocky'){
        // switch chatbot header
        document.getElementById('bocky-conversa-header').classList.remove('hidden');
        document.getElementById('copilot-conversa-header').classList.add('hidden');
        // switch conversa-historico
        document.getElementById('historico-conversa-bocky').style.display = 'flex';
        document.getElementById('historico-conversa-copilot').style.display = 'none';
    } else if (engine == 'copilot') {
        // switch chatbot header
        document.getElementById('bocky-conversa-header').classList.add('hidden');
        document.getElementById('copilot-conversa-header').classList.remove('hidden');
        // switch conversa-historico
        document.getElementById('historico-conversa-bocky').style.display = 'none';
        document.getElementById('historico-conversa-copilot').style.display = 'flex';
    }
    console.log("before resize");
    resizeIframeToConversaBocky();
    console.log("after first resize");
    setTimeout(() => {
        console.log('after second (delayed) resize!')
        resizeIframeToConversaBocky();
    }, 1000);

}

function sendButtonAnimation(){
    // cria a animação de "clicar" no botão
    const botaoEnviar = document.getElementById('send-prompt-button');
    botaoEnviar.classList.add('botao-clicado');
    setTimeout(() => {
        botaoEnviar.classList.remove('botao-clicado');
    }, 220);
}

function getPromptAndClearInputTextbox(){
    // clears the input textbox and returns the prompt
    const prompt = document.getElementById('chatbot-widget-prompt').value;                // get user's prompt
    document.getElementById('chatbot-widget-prompt').value = '';                          // clear input textbox
    document.getElementById('chatbot-widget-prompt').dispatchEvent(new Event('input'));   // trigger textbox's input event listner (to disable send button since the text box has just been emptied)
    return prompt;
}

function drawUserText(prompt, engine="bocky"){
    // draws user's message box
    const message = document.createElement('div');
    const messageBalloon = document.createElement('div');
    const messageText = document.createElement('p');
    const timestamp = document.createElement('p');
    message.classList.add('mensagem-conversa');
    message.classList.add('mensagem-conversa-user');
    messageBalloon.classList.add('message-balloon');
    messageText.textContent = prompt;
    const timestamp_string =  getTimestamp();
    timestamp.textContent = timestamp_string;
    timestamp.classList.add('message-timestamp');

    messageBalloon.appendChild(messageText);
    message.appendChild(messageBalloon);
    message.appendChild(timestamp);
    if (engine == 'bocky'){
        document.getElementById('historico-conversa-bocky').appendChild(message);
        resizeIframeToConversaBocky();
        // update scroll position to the latest message
        message.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    } else if (engine == 'copilot'){
        document.getElementById('historico-conversa-copilot').appendChild(message);
        resizeIframeToConversaBocky();
        // update scroll position to the latest message
        message.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
        });
    }
}

function getTimestamp(){
    const raw_timestamp = new Date();
    const hour = String(raw_timestamp.getHours()).padStart(2, '0');
    const minute = String(raw_timestamp.getMinutes()).padStart(2, '0');
    const second = String(raw_timestamp.getSeconds()).padStart(2, '0');
    
    return `${hour}:${minute}:${second}`;
}

function resizeIframeToConversaBocky(){
    requestAnimationFrame(() => {
        const height = document.getElementById('chatbot-conversa').offsetHeight;
        window.parent.postMessage({ type: 'expand-conversation', height: height}, '*');
    });
}

function addSendButton(){
    if(document.getElementById('send-prompt-button')){
        return;
    }
    const parent_element = document.getElementById('chatbot-widget-prompt-section');

    const button = document.createElement('button');
    button.type ='button';
    button.id ='send-prompt-button';
    button.style.cursor = 'pointer';
    button.onclick = sendPrompt;

    const icon = document.createElement('img');
    icon.src = 'icons/send-icon.png';
    icon.id = 'chatbot-widget-prompt-send-icon';
    icon.setAttribute('aria-label', 'Submit Bocky Prompt');

    button.appendChild(icon);
    parent_element.appendChild(button);
}

function removeSendButton(){
    const button = document.getElementById('send-prompt-button');
    if (button){
        button.parentElement.removeChild(button);
    }
}

function renderBockyResponse(data){
    // from the Bocky response we "convert" it to an HTML div with text and the file references/citations links
    const BACKEND_URI = "https://app-backend-tyifxu7gn33ba.azurewebsites.net";
    let references = [];    
    const message = document.createElement('div');
    let messageString = data.choices[0].message.content.trim();
    const seen = new Map();
    let refIndex = 1;

    function createSupRefLink(ref) {
        if (!seen.has(ref)) {
            seen.set(ref, refIndex);
            references.push(ref);
            refIndex++;
        }
        const link = document.createElement("a");
        link.className = "citation-sup";
        link.title = ref;
        link.href = `${BACKEND_URI}/content/maisDigital/${ref}`;
        link.target = "_blank";
        const sup = document.createElement("sup");
        sup.textContent = seen.get(ref);
        link.appendChild(sup);
        return link;
    }
    
    function appendParsedMessage(parent, text) {
        const regex = /(\*\*.+?\*\*|\[.+?\]|\n)/g;
        let lastIndex = 0, match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parent.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            const token = match[0];
            if (token.startsWith("**")) {
                const strong = document.createElement("strong");
                strong.textContent = token.slice(2, -2);
                parent.appendChild(strong);
            } else if (token.startsWith("[")) {
                parent.appendChild(createSupRefLink(token.slice(1, -1)));
            } else if (token === "\n") {
                parent.appendChild(document.createElement("br"));
            }
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
            parent.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
    }

    appendParsedMessage(message, messageString);

    if (references.length > 0) {
        message.appendChild(document.createElement("br"));
        message.appendChild(document.createElement("br"));
        const citations_title = document.createElement("strong");
        citations_title.textContent = "Citations:";
        message.appendChild(citations_title);
        message.appendChild(document.createElement("br"));
        let refIndex = 1;
        references.forEach(ref => {
            const link = document.createElement("a");
            link.className = "full-citation";
            link.title = ref;
            link.href = `${BACKEND_URI}/content/maisDigital/${ref}`;
            link.target = "_blank";
            link.textContent = `${refIndex++}. ${ref}`;
            message.appendChild(link);
            message.appendChild(document.createElement("br"));
        });
    }

    return message;
}

function renderCopilotResponse(data){
    // from the Copilot response we "convert" it to an HTML div with text and, if applicable, with the file references/citations links
    const message = document.createElement('div');
    const messageString = document.createElement('p');
    messageString.textContent = data.message.trim();
    message.appendChild(messageString);
    return message;
}

function isChatBocky(){
    return !document.getElementById('bocky-conversa-header').classList.contains('hidden');
}


// Event listners
const prompt_textarea = document.getElementById('chatbot-widget-prompt');


prompt_textarea.addEventListener("input", async () => {
    // only display send button when the user has written any non whitespace character
    const canSendPrompt = prompt_textarea.value.trim().length > 0;

    if(canSendPrompt){
        const engine = isChatBocky ? 'bocky' : 'copilot';
        const historico = document.getElementById(`historico-conversa-${engine}`);
        const lastText = historico.lastElementChild;
        if (lastText && lastText.classList.contains('mensagem-conversa-user')){
            // bocky message hasn't "arrived" yet so the user must wait
            removeSendButton();
        } else {
            addSendButton();
        }
    } else{
        removeSendButton();
    }

    const maxHeight = 150;
    prompt_textarea.style.height = "auto";
    let currentHeight = prompt_textarea.scrollHeight;
    if (currentHeight < maxHeight){
        prompt_textarea.style.overflowY = "hidden";
    } else {
        currentHeight = maxHeight;
        prompt_textarea.style.overflowY = "auto";
    }
    prompt_textarea.style.height = currentHeight + "px";

    resizeIframeToConversaBocky();
});

// Event Listner for iframe resize when the window resizes
window.addEventListener('resize', async () => {
    if (document.getElementById('bocky-icon').classList.contains('close')){
        resizeIframeToConversaBocky();
    } else {
        window.parent.postMessage({ type: 'collapse-bocky'}, '*');
    }
});

// MSAL Authentication

// configure MSAL credentials
const msalConfig = {
    auth: {
        clientId: "4fe15b48-5867-4eb4-a575-355d7316cefd",
        authority: "https://login.microsoftonline.com/01c74dcc-1e91-4c9c-b3a0-88030994bf82",
        redirectUri: "https://isabeloliveira31.github.io/bocky-add-on/bocky-add-on.html"
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
let account = null;

async function isSignedIn() {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        account = accounts[0];
        console.log("User is already logged in, no need to authenticate.")
        return true;
    }
    try {
        const silentLoginResponse = await msalInstance.ssoSilent({
            scopes: ["User.Read"],
        });
        account = silentLoginResponse.account;
        console.log("Sucessful silent auth: ", account);
        return true;
    } catch (error) {
        console.warn("Silent auth failed, trying popup auth");
        try {
            const loginResponse = await msalInstance.loginPopup({
                scopes: ["User.Read"]
            });
            account = loginResponse.account;
            console.log("Sucessful popup auth: ", account);
            return true;
        } catch (err) {
            console.error("Popup auth failed: ", err);
            return false;
        }
        return false;
    }
}

async function fetchToken(){
    const account = msalInstance.getAllAccounts()[0];
    const accessTokenRequest = {
        scopes: ["user.read"],
        account: account,
    }

    try{
        let accessTokenResponse = await msalInstance.acquireTokenSilent(accessTokenRequest);
        console.log("Sucessfully got user's token silently");
        return accessTokenResponse.accessToken;
    } catch (error){
        //Acquire token silent failure, and send an interactive request
        console.warn("Failed at getting silent authentication token, trying to get with popup");
        if (error instanceof msal.InteractionRequiredAuthError){
            try{
                accessTokenResponse = await msalInstance.acquireTokenPopup(accessTokenRequest);
                console.log("Sucessfully got user's token interactively(popup)");
                return accessTokenResponse.accessToken;
            }catch(err){
                console.error("Failed at getting interactive(popup) authentication token. Error; ", err);
                return null;
            }
        }
        console.log(error);
        return null;
    }
}

async function getBockyEngineAnswer(token, prompt){
    const mock_response = {"choices": [{"message": {"content": "Ol\u00e1! Sou o Bocky. Em que posso ajud\u00e1-lo?\n\nPara marcar f\u00e9rias, voc\u00ea pode utilizar o sistema da aplica\u00e7\u00e3o \"F\u00e9rias\". Aqui est\u00e3o os passos principais:\n\n1. **Registro do Pedido**: Utilize a funcionalidade **SaveVacationsToApprove** para registrar os dias de f\u00e9rias desejados. O pedido ficar\u00e1 pendente de aprova\u00e7\u00e3o pela chefia [Manual de utilizador_Férias.pdf].\n\n2. **Aprova\u00e7\u00e3o Autom\u00e1tica**: Se voc\u00ea pertence a um grupo funcional com aprova\u00e7\u00e3o autom\u00e1tica, o pedido ser\u00e1 aprovado automaticamente e registrado diretamente no sistema SAP atrav\u00e9s da a\u00e7\u00e3o **SubmitVacationsToSAP** [Manual de utilizador_Férias.pdf].\n\n3. **Visualiza\u00e7\u00e3o e Gest\u00e3o**: Caso seja uma chefia, voc\u00ea pode visualizar e aprovar os pedidos da sua equipa na funcionalidade **VacationsManagement**, garantindo a gest\u00e3o eficiente das aus\u00eancias [Manual de utilizador_Férias.pdf].\n\nSe precisar de ajuda adicional ou mais detalhes[Manual da Isabel.pdf], \u00e9 s\u00f3 dizer! \ud83d\ude0a",},}],};
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mock_response);
        }, 1000);
    }); 
    const response = await fetch('https://app-backend-tyifxu7gn33ba.azurewebsites.net/chatWidget', {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messages: [{content: prompt, role: "user"}],
            "stream": false,
            "context": {
                "overrides": {
                    "top": 10,
                    "retrieval_mode": "hybrid",
                    "semantic_ranker": true,
                    "semantic_captions": false,
                    "temperature": 0.2,
                    "topico": "maisDigital"
                }
            },
            "session_state": null
        }),
    });
    const data = await response.json();
    console.log("A resposta é ", data.choices[0].message.content);
    console.log(data);
    return data;
}

function getCopilotEngineAnswer(prompt){
    return Promise.resolve({
        message: "Hello I'm Copilot Bocky",
    });
}


async function sendPrompt() {
    const promptIsntEmpty = prompt_textarea.value.trim().length > 0;
    if (promptIsntEmpty){
        addSendButton();

        sendButtonAnimation();
        const prompt = getPromptAndClearInputTextbox();

        const isEngineBocky = isChatBocky();
        const engine = isEngineBocky ? 'bocky' : 'copilot';

        drawUserText(prompt, engine);
        
        if(isEngineBocky){
            const response = await getBockyEngineAnswer("", prompt);
            if (response == null){
                console.error("Failed at getting bocky response.");
                return;
            }
            const rendered_response = await renderBockyResponse(response);
            drawResponseText(rendered_response, 'bocky');
        }
        else {
            const response = await getCopilotEngineAnswer(prompt);
            if (response == null){
                console.error("Failed at getting a response from Copilot Bocky.");
                return;
            }
            const rendered_response = await renderCopilotResponse(response);
            drawResponseText(rendered_response, 'copilot');
        }
        document.getElementById("chatbot-widget-prompt").dispatchEvent(new Event('input'));
        setTimeout(() => {
            resizeIframeToConversaBocky();
            setTimeout(() => {
                resizeIframeToConversaBocky();
            }, 50);
        }, 100);
    } else {
        removeSendButton();
    }
}

function drawResponseText(rendered_response, engine){
    // draws response text
    const message = document.createElement('div');
    const messageBalloon = document.createElement('div');

    const timestamp = document.createElement('p');
    message.classList.add('mensagem-conversa');
    message.classList.add('mensagem-conversa-bocky');
    messageBalloon.classList.add('message-balloon');
    const timestamp_string =  getTimestamp();
    timestamp.textContent = timestamp_string;
    timestamp.classList.add('message-timestamp');

    messageBalloon.appendChild(rendered_response);
    message.appendChild(messageBalloon);
    message.appendChild(timestamp);
    if(engine == 'bocky'){
        const historico = document.getElementById('historico-conversa-bocky');
        historico.appendChild(message);
        resizeIframeToConversaBocky();
        // update scroll position place the user's message on top
        message.previousElementSibling.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else if (engine == 'copilot'){
        const historico = document.getElementById('historico-conversa-copilot');
        historico.appendChild(message);
        resizeIframeToConversaBocky();
        // update scroll position place the user's message on top
        message.previousElementSibling.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}