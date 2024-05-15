/**
 * Generic Utility functions for the versatile Custom Blocks plugin.
 */
class Utils {
    constructor() {
        this.isMobile = this.isMobile.bind(this);
        this.getCookie = this.getCookie.bind(this);
    }

    getCookie(cookieName) {
        const name = cookieName + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        for (let i = 0; i < cookieArray.length; i++) {
            let cookie = cookieArray[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(name) === 0) {
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    }

    isMobile() {
        return window.innerWidth <= 1039;
    }
}

export default Utils;
