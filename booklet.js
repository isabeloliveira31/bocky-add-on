javascript:(function(){ 
    const iframe= document.createElement('iframe'); 
    iframe.id = 'bocky-iframe'; 
    iframe.src = 'https://isabeloliveira31.github.io/bocky-add-on/bocky-add-on.html'; 
    iframe.allowTransparency = true; 
    iframe.scrolling = 'no'; 
    Object.assign(iframe.style, { 
        position: 'fixed', 
        border: 'none', 
        zIndex: '2147483647', 
        height: 'calc(6.5vh + 1rem)', 
        width: 'calc(6.5vh + 1rem)', 
        bottom: 'min(50px, 5%)', 
        right: 'min(40px, 4%)', 
        background: 'none', 
        backgroundColor: 'darkBlue'
    }); 
    document.body.appendChild(iframe); 
    window.addEventListener('message', (event) => { 
        if (event.data.type === 'expand-bocky') { 
            iframe.style.width = event.data.width + 'px'; 
            iframe.style.height = event.data.height + 'px'; 
        } else if (event.data.type === 'collapse-bocky') { 
            iframe.style.width = event.data.radius + 'px'; 
            iframe.style.height = event.data.radius + 'px'; 
        }
    }); 
})();
