export class Canvas {
    constructor(canvasId) {
        this.canvas = document.querySelector('#' + canvasId);
        this.pointer = document.querySelector('#pointer');
        this.ctx = this.canvas.getContext('2d');
        this.fitToContainer();

        /*
        this.ctx.shadowColor = '#333';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        */

        // this.draw({x: 0.0, y: 0.0}, {x: 1.0, y: 1.0})

        // this.ctx.fillStyle='yellow';
        // for (var i=0;i<5;++i) this.ctx.fillRect(i*18+2,2,16,16);

        // set last styles and position for setting the begin
        this.lastPos = null;
        this.beforeLastPos = null;
        this.lastColor = null;
        this.lastLineWidth = null;
    }

    fitToContainer() {
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    floatToPixelCoords(floatCoords) {
        return {x: floatCoords.x * this.canvas.width, y: floatCoords.y * this.canvas.height}
    }

    movePointer(to) {
        const coords = this.floatToPixelCoords(to)
        this.pointer.style.left = this.canvas.getBoundingClientRect().left + coords.x + "px";
        this.pointer.style.top  = this.canvas.getBoundingClientRect().top + coords.y + "px";
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

        let paint = true;
        // begin if color changed, style,  or line begins ..
        if (!this.lastPos || !(this.lastColor === color) || !(this.lastLineWidth === lineWidth)) {
          this.ctx.beginPath();
          this.ctx.moveTo(fromX, fromY);
          this.lastPos = from;
        } else { // check if delta to the last position is big enough ..
          let d = (fromX-toX)*(fromX-toX) + (fromY-toY)*(fromY-toY)
          if (d < 3*3)  // set quadratic radius
            paint = false
        }
        if (paint) {
          // compute arc if needed ... using the quadraticCurveTo
          let cX = 0;
          let cY = 0;
          let curvyness = 0.2;
          if (!this.beforeLastPos) {
            cX = this.lastPos.x
            cY = this.lastPos.y
          } else {
            cX = this.lastPos.x + (this.lastPos.x - this.beforeLastPos.x)*curvyness;
            cY = this.lastPos.y + (this.lastPos.y - this.beforeLastPos.y)*curvyness;
          }

          // reset memory from the last step
          this.beforeLastPos = this.lastPos;
          this.lastPos = to;
          this.lastColor = color;
          this.lastLineWidth = lineWidth;
          // draw a line
          // this.ctx.moveTo(fromX, fromY); // done above ..
          //this.ctx.lineTo(toX, toY);
          this.ctx.quadraticCurveTo(cX* this.canvas.width, cY* this.canvas.height, toX, toY);
          this.ctx.stroke();
        }

    }

    clear() {
      this.lastPos = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBegin() {
      // check ..
      this.ctx.beginPath();
      // console.log("#DEBUG - Should go on like rocket science.")
      this.lastPos = null;
      this.beforeLastPos = null;

    }
}
