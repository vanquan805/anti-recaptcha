// google-chrome --disable-gpu --disable-software-rasterizer --disable-features=NetworkService --remote-debugging-port=9222 --user-data-dir="test"

const CDP = require('chrome-remote-interface');
let request = require('request');
let fs = require('fs');
let {execSync} = require('child_process');

let timeout = async function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

let promisify = (inner) => {
    return new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );
};


async function antiCaptcha(Runtime) {
    let linkDownload = await Runtime.evaluate({
        expression: `iframes[2].contentWindow.document.querySelector('.rc-audiochallenge-tdownload-link').href;`
    });

    console.log(linkDownload);

    await promisify(cb => request.get(linkDownload.result.value, {headers: {'content-type': 'audio/mp3'}}, cb).pipe(fs.createWriteStream('audio.mp3')));
    let text = execSync('python convert.py', {'encoding': 'utf8'});
    console.log(text);

    await timeout(3000);

    await Runtime.evaluate({
        expression: `iframes[2].contentWindow.document.querySelector('#audio-response').value = '${text.trim()}';`
    });

    await timeout(3000);
    await Runtime.evaluate({
        expression: `iframes[2].contentWindow.document.querySelector('#recaptcha-verify-button').click();`
    });
}


(async () => {
    let client;
    try{
        await timeout(3000)

        client = await CDP();

        const {Network, Page, Runtime, DOM} = client;

        await Page.enable();
        await Runtime.enable();

        await Page.navigate({url: 'https://www.google.com/recaptcha/api2/demo'});
        await Page.loadEventFired();
        await timeout(3000);

        let script = `
	        let iframes = document.querySelectorAll('iframe');
	        iframes[0].contentWindow.document.querySelector('#recaptcha-anchor').click();
	        `;
        await Runtime.evaluate({
            expression: script
        });
        await timeout(3000);

        await Runtime.evaluate({
            expression: `iframes[2].contentWindow.document.querySelector('#recaptcha-audio-button').click();`
        });
        await timeout(3000);

        await antiCaptcha(Runtime);
        await timeout(3000);

        let isResolve = await Runtime.evaluate({
            expression: `document.querySelector('#g-recaptcha-response').value;`
        });

        while (isResolve.result.value.length === 0) {
            await antiCaptcha(Runtime);
            await timeout(2000);
            isResolve = await Runtime.evaluate({
                expression: `document.querySelector('#g-recaptcha-response').value;`
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        if (client) {
            await client.close();
        }
    }
})();