export class Canvas {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.fitToContainer();

        this.ctx.shadowColor = '#333';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // this.draw({x: 0.0, y: 0.0}, {x: 1.0, y: 1.0})

        // this.ctx.fillStyle='yellow';
        // for (var i=0;i<5;++i) this.ctx.fillRect(i*18+2,2,16,16);

        // set last styles and position for setting the begin
        this.lastPos = null;
        this.lastColor = null;
    }

    fitToContainer() {
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }


    // points (from/to) are floats betw. 0.0-1.0 in format {x, y}, e.g. {0.2, 0.9}
    draw(from, to, lineWidth = 3, color = "black") {

        // pixel conversion
        const fromX = from.x * this.canvas.width;
        const fromY = from.y * this.canvas.height;
        const toX = to.x * this.canvas.width;
        const toY = to.y * this.canvas.height;

        // set line stroke and line width
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;

        // begin if color changed or line begins ..
        if (!this.lastPos || !(this.lastColor === color)) {
          this.ctx.beginPath();
          this.ctx.moveTo(fromX, fromY);
        }
        this.lastPos = to;
        this.lastColor = color;
        // draw a line
        // this.ctx.moveTo(fromX, fromY); // done above ..
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();


    }
}
