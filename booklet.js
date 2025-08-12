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
        backgroundColor: 'none'
    }); 
    document.body.appendChild(iframe); 
    window.addEventListener('message', (event) => { 
        if (event.data.type === 'expand-conversation') { 
            if(window.innerWidth < 450){
                iframe.style.width = '90vw';
                console.log("size A (< 450)");
            } else if (window.innerWidth < 700){
                iframe.style.width = '55vw';
                console.log("size B (< 700)");
            } else if (window.innerWidth < 900){
                iframe.style.width = '40vw';
                console.log('size C (<900)');
            } else if (window.innerWidth < 1550){
                iframe.style.width = '30vw';
                console.log ('size D (<1550)');
            } else {
                iframe.style.width = '25vw';
                console.log('size E (> 1550)');
            }
            /* iframe.style.width = 'clamp(20vw, 70rem,90vw)'; OR 10vw+12rem  OR max(20vw,200rem) */
            /* iframe.style.width = event.data.width + 'px'; */
            iframe.style.height = event.data.height + 'px'; /* use clamp with visualViewport.height * 0.9 as max */
        } else if (event.data.type === 'collapse-bocky') { 
            iframe.style.width = 'calc(6.5vh + 1rem)';
            iframe.style.height = 'calc(6.5vh + 1rem)';
        }
    }); 
})();
