# FontRenderer
A font rendering tool using WebGL and Javascript.

## Getting started

```javascript

var fr = new FontRenderer(canvas);
fr.init();
fr.setFont("Verdana");
fr.setFontSize(30);
fr.setColour(255, 255, 255);

fr.drawString("Hello World!", 0, 100, 256, 32);

```

First the font renderer is created with a canvas element. Next the tool is initialized, this simply sets up WebGL and the shaders. The font, fontsize and colour is then set. Finally the string "Hello World!" is drawn at x = 0 and y = 100. The last two parameters are the width and height of the boundaries where the string gets rendered to. These must be powers of 2 and the smaller they are the more efficient this process will be. Width = 256 and height = 32 are chosen because that is big enough to fit "Hello World!" at font size 30. In the future I hope for the last two parameters to be handled internally.
