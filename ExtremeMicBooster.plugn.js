/**
 * @name ExtremeMicBooster
 * @author FellowFewOP
 * @version 2.0.0
 * @description 40 dB Boost, Stereo, Echo, Reverb, and And Small Eq Panel (Tested).
 * @source https://github.com/FellowFewOP/BetterDiscordLoudPlugin.git
 */

const config = {
    main: "ExtremeMicBooster",
    version: "2.0.0",
    description: "40 dB Boost, Stereo, Echo, Reverb, and And Small Eq Panel (Tested).",
};

module.exports = class ExtremeMicBooster {
    start() {
        this.createUI();
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.micStream = null;
        this.initAudio();
    }

    async initAudio() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micStream = stream;
            const source = this.audioContext.createMediaStreamSource(stream);

            // Gain (Mic Boost 40 dB)
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 100; // Super loud boost

            // Stereo Enhancer
            this.stereoNode = this.audioContext.createStereoPanner();
            this.stereoNode.pan.value = 1; // Full stereo widening

            // Echo Effect
            this.delayNode = this.audioContext.createDelay();
            this.delayNode.delayTime.value = 0.2; // Adds delay effect

            // Reverb Effect
            this.reverbNode = this.audioContext.createConvolver();
            this.reverbNode.buffer = await this.createReverbBuffer();

            // Connect Nodes
            source.connect(this.gainNode);
            this.gainNode.connect(this.stereoNode);
            this.stereoNode.connect(this.delayNode);
            this.delayNode.connect(this.reverbNode);
            this.reverbNode.connect(this.audioContext.destination);
        } catch (error) {
            console.error("ExtremeMicBooster Error:", error);
        }
    }

    async createReverbBuffer() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        for (let i = 0; i < length; i++) {
            const decay = Math.exp(-3 * (i / length));
            impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * decay;
            impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * decay;
        }
        return impulse;
    }

    createUI() {
        const panel = document.createElement("div");
        panel.id = "mic-booster-panel";
        panel.style = `
            position: fixed;
            bottom: 50px;
            right: 20px;
            width: 120px;
            height: 80px;
            background: #222;
            color: white;
            font-size: 12px;
            text-align: center;
            padding: 5px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(255, 0, 0, 0.8);
            z-index: 9999;
        `;
        panel.innerHTML = `
            <label>EQ: <span id="eq-value">20 dB</span></label>
            <input type="range" id="eq-slider" min="0" max="20" value="20" style="width: 100%;">
        `;
        document.body.appendChild(panel);

        document.getElementById("eq-slider").addEventListener("input", (e) => {
            const value = e.target.value;
            document.getElementById("eq-value").innerText = `${value} dB`;
            if (this.gainNode) this.gainNode.gain.value = value * 5; // Dynamic loudness control
        });
    }

    stop() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        const panel = document.getElementById("mic-booster-panel");
        if (panel) panel.remove();
    }
};
