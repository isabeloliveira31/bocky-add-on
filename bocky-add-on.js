function abrirConversa() {
    document.getElementById('bocky-icon').classList.add('close');
    setTimeout(() => {
        requestAnimationFrame(() => resizeIframeToConversaBocky());
        document.getElementById('bocky-conversa').classList.add('open');
        setTimeout(() => {
            requestAnimationFrame(() => resizeIframeToConversaBocky());
        }, 100);
    }, 150);
}

function esconderConversa() {
    document.getElementById('bocky-conversa').classList.remove('open');
    window.parent.postMessage({ type: 'collapse-bocky'}, '*');
    document.getElementById('bocky-icon').classList.remove('close');
}

function chooseBockyEngine(engine){
    if (engine == 'traditional'){
        document.getElementById('bocky-engine-traditional').classList.add('selected');
        document.getElementById('bocky-engine-copilot').classList.remove('selected');
    } else if (engine == 'copilot') {
        document.getElementById('bocky-engine-copilot').classList.add('selected');
        document.getElementById('bocky-engine-traditional').classList.remove('selected');
    }
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

function drawUserText(prompt){
    // draws user's message box
    const mensagem = document.createElement('div');
    mensagem.textContent = prompt;
    mensagem.classList.add('mensagem-conversa');
    mensagem.classList.add('mensagem-conversa-user');
    mensagem.classList.add('.font-size-small');
    document.getElementById('historico-conversa').appendChild(mensagem);
    // update scroll position to the latest message
    document.getElementById('historico-conversa').scrollTop = document.getElementById('historico-conversa').scrollHeight;
    requestAnimationFrame(() => resizeIframeToConversaBocky());
}

function resizeIframeToConversaBocky(){
    const height = document.getElementById('bocky-conversa').offsetHeight;
    window.parent.postMessage({ type: 'expand-conversation', height: height}, '*');
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
    button.onclick = sendPrompt();

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
    requestAnimationFrame(() => resizeIframeToConversaBocky());
    
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