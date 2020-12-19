export class Canvas {
    constructor() {
        this.canvas = document.querySelector('canvas'),
        this.ctx = canvas.getContext('2d');
        this.fitToContainer();

        this.draw({x: 0.0, y: 0.0}, {x: 1.0, y: 1.0})

        // this.ctx.fillStyle='yellow';
        // for (var i=0;i<5;++i) this.ctx.fillRect(i*18+2,2,16,16);
    }

    fitToContainer(){
        this.canvas.style.width='100%';
        this.canvas.style.height='100%';
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }


    // points (from/to) are floats betw. 0.0-1.0 in format {x, y}, e.g. {0.2, 0.9}
    draw(from, to, lineWidth = 3, color="black") {

        // pixel conversion
        from.x *= this.canvas.width;
        from.y *= this.canvas.height;
        to.x *= this.canvas.width;
        to.y *= this.canvas.height;

        // set line stroke and line width
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;

        // draw a red line
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    }
}