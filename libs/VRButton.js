class VRButton {

    constructor(renderer, options) {
        this.renderer = renderer;
        if (options !== undefined) {
            this.onSessionStart = options.onSessionStart;
            this.onSessionEnd = options.onSessionEnd;
            this.sessionInit = options.sessionInit;
            this.sessionMode = (options.inline !== undefined && options.inline) ? 'inline' : 'immersive-vr';
        } else {
            this.sessionMode = 'immersive-vr';
        }

        if (this.sessionInit === undefined) this.sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };

        if ('xr' in navigator) {

            const button = document.createElement('button');
            button.style.display = 'none';
            button.style.height = '40px';

            navigator.xr.isSessionSupported(this.sessionMode).then((supported) => {

                supported ? this.showEnterVR(button) : this.showWebXRNotFound(button);
                if (options && options.vrStatus) options.vrStatus(supported);

            });

            document.body.appendChild(button);

        } else {

            const message = document.createElement('a');

            if (window.isSecureContext === false) {

                message.href = document.location.href.replace(/^http:/, 'https:');
                message.innerHTML = 'WEBXR NEEDS HTTPS';

            } else {

                message.href = 'https://immersiveweb.dev/';
                message.innerHTML = 'WEBXR NOT AVAILABLE';

            }

            message.style.left = '0px';
            message.style.width = '100%';
            message.style.textDecoration = 'none';

            this.stylizeElement(message, false);
            message.style.bottom = '0px';
            message.style.opacity = '1';

            document.body.appendChild(message);

            if (options.vrStatus) options.vrStatus(false);

        }

    }

    showEnterVR(button) {

        let currentSession = null;
        const self = this;

        this.stylizeElement(button, true);

        function onSessionStarted(session) {

            session.addEventListener('end', onSessionEnded);

            self.renderer.xr.setSession(session);
            self.stylizeElement(button, true);

            button.textContent = 'EXIT VR';

            currentSession = session;

            if (self.onSessionStart !== undefined) self.onSessionStart();

        }

        function onSessionEnded() {

            currentSession.removeEventListener('end', onSessionEnded);

            self.stylizeElement(button, true);
            button.textContent = 'ENTER VR';

            currentSession = null;

            if (self.onSessionEnd !== undefined) self.onSessionEnd();

        }

        //

        button.style.display = '';
        button.style.position = 'absolute';
        button.style.left = '50%';
        button.style.top = '50%';
        button.style.transform = 'translate(-50%, -50%)';
        button.style.width = '120px';
        button.style.height = '120px';
        button.style.cursor = 'pointer';
        button.style.backgroundColor = 'orange';
        button.innerHTML = '<i class="fas fa-vr-cardboard" style="font-size: 40px;"></i>';
        button.style.animation = 'bounce 2s infinite';
        button.style.clipPath = 'polygon(50% 0%, 82% 18%, 100% 50%, 82% 82%, 50% 100%, 18% 82%, 0% 50%, 18% 18%)'; // Octagon shape

        button.onmouseenter = function () {
            button.style.backgroundColor = 'darkorange';
            button.style.fontWeight = 'bold';
            button.style.fontFamily = 'Arial, sans-serif';
            button.innerHTML = 'ENTER VR';
        };

        button.onmouseleave = function () {
            button.style.backgroundColor = 'orange';
            button.style.fontWeight = '';
            button.style.fontFamily = '';
            button.innerHTML = '<i class="fas fa-vr-cardboard" style="font-size: 40px;"></i>';
        };

        button.onclick = function () {

            if (currentSession === null) {

                navigator.xr.requestSession(self.sessionMode, self.sessionInit).then(onSessionStarted);

            } else {

                currentSession.end();

            }

        };

        const keyframes = `
            @keyframes bounce {
                0%, 100% {
                    transform: translate(-50%, -50%) scale(1);
                }
                50% {
                    transform: translate(-50%, -50%) scale(1.1);
                }
            }
        `;

        const style = document.createElement('style');
        style.appendChild(document.createTextNode(keyframes));
        document.head.appendChild(style);

    }

    disableButton(button) {

        button.style.cursor = 'auto';
        button.style.opacity = '0.5';

        button.onmouseenter = null;
        button.onmouseleave = null;

        button.onclick = null;

    }

    showWebXRNotFound(button) {
        this.stylizeElement(button, false);

        this.disableButton(button);

        button.style.display = '';
        button.style.width = '100%';
        button.style.right = '0px';
        button.style.bottom = '0px';
        button.style.border = '';
        button.style.opacity = '1';
        button.style.fontSize = '13px';
        button.textContent = 'VR NOT SUPPORTED';

    }

    stylizeElement(element, active = true) {

        element.style.position = 'absolute';
        element.style.bottom = '20px';
        element.style.padding = '12px 6px';
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = (active) ? 'orange' : 'rgba(180,20,20,1)';
        element.style.color = '#fff';
        element.style.font = 'normal 20px sans-serif';
        element.style.textAlign = 'center';
        element.style.opacity = '0.8'; // Reduced opacity
        element.style.outline = 'none';
        element.style.zIndex = '999';

    }

};

export { VRButton };
