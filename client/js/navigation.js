
(() => {
    let oldPushState = history.pushState;
    history.pushState = function pushState() {
        let ret = oldPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    let oldReplaceState = history.replaceState;
    history.replaceState = function replaceState() {
        let ret = oldReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });
})();


window.addEventListener('locationchange',urlChange)


function urlChange(e){
    let url = new URL(window.location.href);


    if(!url.searchParams.get("roomId")&&url.pathname !== '/group'){
        toggleElement(sectionMenu,true)
        toggleElement(sectionBattle,false);
        toggleElement(sectionRoom,false);

    }

    if(url.pathname === '/group'){
        toggleElement(sectionMenu,false)
        toggleElement(sectionRoom,true);
    }


}