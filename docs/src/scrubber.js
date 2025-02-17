// Custom Scrubber class
class Scrubber extends EventTarget {
    constructor(values, {
        format = value => value,
        initial = 0,
        direction = 1,
        delay = null,
        autoplay = true,
        loop = true,
        loopDelay = null,
        alternate = false
    } = {}) {
        super();
        this.values = Array.from(values);
        this.format = format;
        this.direction = direction;
        this.delay = delay;
        this.loop = loop;
        this.loopDelay = loopDelay;
        this.alternate = alternate;
        
        this.frame = null;
        this.timer = null;
        this.interval = null;
        
        // Create DOM elements
        this.element = document.createElement('form');
        this.element.className = 'scrubber';
        
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'scrubber-button';
        
        this.input = document.createElement('input');
        this.input.type = 'range';
        this.input.min = 0;
        this.input.max = this.values.length - 1;
        this.input.value = initial;
        this.input.step = 1;
        this.input.className = 'scrubber-input';
        
        this.output = document.createElement('output');
        this.output.className = 'scrubber-output';
        
        const label = document.createElement('label');
        label.className = 'scrubber-label';
        label.appendChild(this.input);
        label.appendChild(this.output);
        
        this.element.appendChild(this.button);
        this.element.appendChild(label);
        
        // Setup event handlers
        this.setupEventListeners();
        
        // Initialize
        this.updateOutput();
        if (autoplay) this.start();
        else this.stop();
    }
    
    setupEventListeners() {
        this.input.oninput = (event) => {
            if (event && event.isTrusted && this.isRunning()) {
                this.stop();
            }
            this.value = this.values[this.input.valueAsNumber];
            this.updateOutput();
            this.dispatchEvent(new CustomEvent('input', { detail: this.value }));
        };
        
        this.button.onclick = () => {
            if (this.isRunning()) {
                this.stop();
            } else {
                this.direction = this.alternate && this.input.valueAsNumber === this.values.length - 1 ? -1 : 1;
                this.step();
                this.start();
            }
        };
    }
    
    updateOutput() {
        this.output.value = this.format(this.value, this.input.valueAsNumber, this.values);
    }
    
    isRunning() {
        return this.frame !== null || this.timer !== null || this.interval !== null;
    }
    
    start() {
        this.button.textContent = "Pause";
        if (this.delay === null) {
            this.frame = requestAnimationFrame(() => this.tick());
        } else {
            this.interval = setInterval(() => this.tick(), this.delay);
        }
    }
    
    stop() {
        this.button.textContent = "Play";
        if (this.frame !== null) {
            cancelAnimationFrame(this.frame);
            this.frame = null;
        }
        if (this.timer !== null) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
    
    tick() {
        if (this.input.valueAsNumber === (this.direction > 0 ? this.values.length - 1 : this.direction < 0 ? 0 : NaN)) {
            if (!this.loop) {
                this.stop();
                return;
            }
            if (this.alternate) {
                this.direction = -this.direction;
            }
            if (this.loopDelay !== null) {
                this.stop();
                this.timer = setTimeout(() => {
                    this.step();
                    this.start();
                }, this.loopDelay);
                return;
            }
        }
        if (this.delay === null) {
            this.frame = requestAnimationFrame(() => this.tick());
        }
        this.step();
    }
    
    step() {
        this.input.valueAsNumber = (this.input.valueAsNumber + this.direction + this.values.length) % this.values.length;
        this.input.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    }
}

export function initScrubber(data) {
    const years = [...new Set(data.map(d => d.Year))];
    const scrubber = new Scrubber(years, {
        delay: 1000, // Increased from 250 to 1000ms
        format: year => `Year: ${year}`
    });
    
    document.getElementById('controls').appendChild(scrubber.element);
    
    return scrubber;
}