function abrirConversa() {
    document.getElementById('bocky-icon').classList.add('close');
    setTimeout(() => {
        resizeIframeToConversaBocky();
        document.getElementById('chatbot-conversa').classList.add('open');
        setTimeout(() => {
            resizeIframeToConversaBocky();
        }, 100);
    }, 150);
}

function esconderConversa() {
    document.getElementById('chatbot-conversa').classList.remove('open');
    window.parent.postMessage({ type: 'collapse-bocky'}, '*');
    document.getElementById('bocky-icon').classList.remove('close');
}

function chooseEngine(engine){
    if (engine == 'bocky'){
        console.log("choosing bocky");
        // switch chatbot header
        document.getElementById('bocky-conversa-header').classList.remove('hidden');
        document.getElementById('copilot-conversa-header').classList.add('hidden');
        // switch conversa-historico
        document.getElementById('historico-conversa-bocky').style.display = 'flex';
        document.getElementById('historico-conversa-copilot').style.display = 'none';
    } else if (engine == 'copilot') {
        console.log("choosing copilot");    
        // switch chatbot header
        document.getElementById('bocky-conversa-header').classList.add('hidden');
        document.getElementById('copilot-conversa-header').classList.remove('hidden');
        // switch conversa-historico
        document.getElementById('historico-conversa-bocky').style.display = 'none';
        document.getElementById('historico-conversa-copilot').style.display = 'flex';
    }
    resizeIframeToConversaBocky();
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
    const prompt = document.getElementById('bocky-widget-prompt').value;                // get user's prompt
    document.getElementById('bocky-widget-prompt').value = '';                          // clear input textbox
    document.getElementById('bocky-widget-prompt').dispatchEvent(new Event('input'));   // trigger textbox's input event listner (to disable send button since the text box has just been emptied)
    return prompt;
}

function drawUserText(prompt, engine="bocky"){
    // draws user's message box
    const message = document.createElement('div');
    const messageBalloon = document.createElement('div');
    const balloonPointer = document.createElement('div');
    const messageText = document.createElement('p');
    const timestamp = document.createElement('p');
    message.classList.add('mensagem-conversa');
    message.classList.add('mensagem-conversa-user');
    messageBalloon.classList.add('message-balloon');
    balloonPointer.classList.add('balloon-pointer');
    messageText.textContent = prompt;
    const timestamp_string =  getTimestamp();
    timestamp.textContent = timestamp_string;
    timestamp.classList.add('message-timestamp');

    messageBalloon.appendChild(messageText);
    message.appendChild(messageBalloon);
    message.appendChild(balloonPointer);
    message.appendChild(timestamp);
    if (engine == 'bocky'){
        document.getElementById('historico-conversa-bocky').appendChild(message);
        // update scroll position to the latest message
        document.getElementById('historico-conversa-bocky').scrollTop = document.getElementById('historico-conversa-bocky').scrollHeight;

    } else if (engine == 'copilot'){
        document.getElementById('historico-conversa-copilot').appendChild(message);
        // update scroll position to the latest message
        document.getElementById('historico-conversa-copilot').scrollTop = document.getElementById('historico-conversa-copilot').scrollHeight;
    }
    resizeIframeToConversaBocky();
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
    const parent_element = document.getElementById('bocky-widget-prompt-section');

    const button = document.createElement('button');
    button.type ='button';
    button.id ='send-prompt-button';
    button.style.cursor = 'pointer';
    button.onclick = sendPrompt;

    const icon = document.createElement('img');
    icon.src = 'icons/send-icon.png';
    icon.id = 'bocky-widget-prompt-send-icon';
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

// Event listners
const prompt_textarea = document.getElementById('bocky-widget-prompt');

// Event Listner to user's input textbox to only activate the send button when the user has written any non whitespace character
prompt_textarea.addEventListener("input", async () => {
    const canSendPrompt = prompt_textarea.value.trim().length > 0;
    if(canSendPrompt){
        addSendButton();
    } else{
        removeSendButton();
    }
    resizeIframeToConversaBocky();
    
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
    return Promise.resolve({
        message: "Hello I'm Traditional Bocky",
    });
}

function getCopilotEngineAnswer(prompt){
    return Promise.resolve({
        message: "Hello I'm Copilot Bocky",
    });
}