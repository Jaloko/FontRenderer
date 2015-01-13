var canvas;
var fontRenderer;

function init() {
	canvas = document.getElementById("canvas");

	fontRenderer = new FontRenderer(canvas);
    fontRenderer.init();
    fontRenderer.setFont("Verdana");
    fontRenderer.setFontSize(30);
    // Red
    fontRenderer.setColour(255, 0, 0);
    update();
}

function update() {
    render();
	requestAnimationFrame(update);
}

function render() {
    fontRenderer.drawString("This is a test string being rendered in WebGL!", 0, 200, 1024, 64);
}