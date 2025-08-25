javascript:(function(){ 
    const iframe= document.createElement('iframe'); 
    iframe.id = 'bocky-iframe'; 
    iframe.src = 'https://isabeloliveira31.github.io/bocky-add-on/bocky-add-on-mock-response.html'; 
    iframe.allowTransparency = true; 
    iframe.scrolling = 'no'; 
    Object.assign(iframe.style, { 
        position: 'fixed', 
        border: 'none', 
        zIndex: '2147483647', 
        /* MEDIDAS ANTIGAS */
        height: 'calc(7vh + 1.3rem)', 
        width: 'calc(7vh + 1.3rem)', 
        bottom: 'min(50px, 5%)', 
        right: 'min(40px, 4%)',
        /* MEDIDAS FIGMA */
        /* height: 'calc(7.1vh + 1.35rem)', */ /* adapted from 88px */
        /* width: 'calc(7.1vh + 1.35rem)', */
        /* bottom: 'calc(0.5vh + 0.2rem)', */ /* adapted from 8px */
        /* right: 'calc(0.5vh + 0.2rem)', */
        background: 'none', 
        backgroundColor: 'transparent'
    }); 
    document.body.appendChild(iframe); 
    window.addEventListener('message', (event) => { 
        if (event.data.type === 'expand-conversation') { 
            if(window.innerWidth < 600){
                iframe.style.width = '90vw';
                console.log("size A (< 600)");
            } else if (window.innerWidth < 750){
                iframe.style.width = '80vw';
                console.log("size B (< 750)");
            } else if (window.innerWidth < 900){
                iframe.style.width = '70vw';
                console.log('size C (<900)');
            } else if (window.innerWidth < 1050) {
                iframe.style.width = '60vw';
                console.log('size D (<1050)');
            } else if (window.innerWidth < 1250) {
                iframe.style.width = '50vw';
                console.log('size E (<1250)');
            } else if (window.innerWidth < 2550){
                iframe.style.width = '40vw';
                console.log ('size F (<2550)');
            } else {
                iframe.style.width = '30vw';
                console.log('size G (> 2550)');
            }
            iframe.style.height = event.data.height + 'px';
        } else if (event.data.type === 'collapse-bocky') { 
            iframe.style.width = 'calc(7vh + 1.3rem)';
            iframe.style.height = 'calc(7vh + 1.3rem)';
        }
    }); 
})();
