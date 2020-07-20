const CDP = require('chrome-remote-interface');

async function mouseClick(client, x, y) {
    const options = {
        x: x,
        y: y,
        button: 'left',
        clickCount: 1
    };

    options.type = 'mousePressed';
    await client.Input.dispatchMouseEvent(options);

    options.type = 'mouseReleased';
    await client.Input.dispatchMouseEvent(options);
}

async function sendKey(client, text) {
    for (var i = 0; i < text.length; i++) {
        await client.Input.dispatchKeyEvent({type: 'char', text: text[i]});
    }
}