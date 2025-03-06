/**
 * @name 20dB Mic Booster
 * @author YourName
 * @version 1.0.0
 * @description Boosts mic by 20 dB with built-in stereo widening. No virtual cables needed.
 * @source https://github.com/FellowFewOP/BetterDiscordLoudPlugin.git
 */

module.exports = class MicBooster {
    start() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.micStream = null;
        this.initAudio();
    }

    async initAudio() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.micStream = stream;
            const source = this.audioContext.createMediaStreamSource(stream);

            // Gain Node (20 dB Boost)
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 10; // 20 dB boost

            // Stereo Panning (Widening Effect)
            const stereoPanner = this.audioContext.createStereoPanner();
            stereoPanner.pan.value = 0.5; // Slight stereo effect

            // Connect nodes
            source.connect(gainNode);
            gainNode.connect(stereoPanner);
            stereoPanner.connect(this.audioContext.destination);
        } catch (error) {
            console.error("MicBooster Error:", error);
        }
    }

    stop() {
        if (this.micStream) {
            this.micStream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
};
