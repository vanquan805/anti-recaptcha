let fs = require('fs');
let request = require('request');
let {execSync} = require('child_process');

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

async function speed_to_text(audio_file, lang = 'en-US') {
    audio_file = await convert2Wav(audio_file);
    var audio_content = Buffer.from(fs.readFileSync(audio_file), 'binary').toString('base64');
    let info = execSync(`ffprobe -i ${audio_file} -show_entries stream=channels,sample_rate -of compact=p=0:nk=1 -v 0`, {encoding: 'utf8'});
    info = info.trim().split('|');
    let response = await promisify(cb => request.post('https://cxl-services.appspot.com/proxy?url=https%3A%2F%2Fspeech.googleapis.com%2Fv1p1beta1%2Fspeech%3Arecognize&token=03AGdBq27fD7jhf6cx6xYI_vrGaftxoX3HtnCWJTouRg3x6PUrpWx4QDY8ms1fxf5dogeL2fv8uvHTOkOJrmCKZuNnuiBCdQnEn9p87iAL9EcijLktovvkVm-k9QeOlOUCHo5ZLd40kfEvPwe21B0IF8715LyEBs9QxLClHkq3jtua6mzqhX2FdecArdu05pwrzzRucH6TYYAFfMdKY8KKaeeUdbUIVDgy2HlAvdfQjg6MbT1SBFe624tUEjvqzXIxXkHsmyihe0G8SJiyK5TGlcP3SNidRBPwrv1yKVWsI5UknYppcvAS9ndIFMcmaVE97yCavL554f8_lSM7ApFq6Fc5QQCvbmypc1LfykOyUzawYQglfQplQMgi4Iut_ybz0N4HKVaZk9-A', {
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "audio": {
                "content": audio_content
            },
            "config": {
                "enableAutomaticPunctuation": true,
                "encoding": "LINEAR16",
                "languageCode": lang,
                "model": "default",
                "audioChannelCount": info[1]
            }
        })
    }, cb));

    console.log(response.body);
}

async function convert2Wav(audio_file) {
    try {
        let temp = audio_file.split('.');

        if (temp[temp.length - 1] !== 'wav') {
            let audio_file_old = audio_file;
            audio_file = audio_file.replace(new RegExp(temp[temp.length - 1], 'gi'), 'wav');
            let test = execSync(`ffmpeg -i ${audio_file_old} ${audio_file}`, {encoding: 'utf8'});
        }

    }catch (e) {
        console.log(e);
    }
    return audio_file;
}

(async () => {
    let list = {
        "af-ZA": "Afrikaans (South Africa)",
        "am-ET": "Amharic (Ethiopia)",
        "hy-AM": "Armenian (Armenia)",
        "az-AZ": "Azerbaijani (Azerbaijan)",
        "id-ID": "Indonesian (Indonesia)",
        "ms-MY": "Malay (Malaysia)",
        "bn-BD": "Bengali (Bangladesh)",
        "bn-IN": "Bengali (India)",
        "ca-ES": "Catalan (Spain)",
        "cs-CZ": "Czech (Czech Republic)",
        "da-DK": "Danish (Denmark)",
        "de-DE": "German (Germany)",
        "en-AU": "English (Australia)",
        "en-CA": "English (Canada)",
        "en-GH": "English (Ghana)",
        "en-GB": "English (United Kingdom)",
        "en-IN": "English (India)",
        "en-IE": "English (Ireland)",
        "en-KE": "English (Kenya)",
        "en-NZ": "English (New Zealand)",
        "en-NG": "English (Nigeria)",
        "en-PH": "English (Philippines)",
        "en-SG": "English (Singapore)",
        "en-ZA": "English (South Africa)",
        "en-TZ": "English (Tanzania)",
        "en-US": "English (United States)",
        "es-AR": "Spanish (Argentina)",
        "es-BO": "Spanish (Bolivia)",
        "es-CL": "Spanish (Chile)",
        "es-CO": "Spanish (Colombia)",
        "es-CR": "Spanish (Costa Rica)",
        "es-EC": "Spanish (Ecuador)",
        "es-SV": "Spanish (El Salvador)",
        "es-ES": "Spanish (Spain)",
        "es-US": "Spanish (United States)",
        "es-GT": "Spanish (Guatemala)",
        "es-HN": "Spanish (Honduras)",
        "es-MX": "Spanish (Mexico)",
        "es-NI": "Spanish (Nicaragua)",
        "es-PA": "Spanish (Panama)",
        "es-PY": "Spanish (Paraguay)",
        "es-PE": "Spanish (Peru)",
        "es-PR": "Spanish (Puerto Rico)",
        "es-DO": "Spanish (Dominican Republic)",
        "es-UY": "Spanish (Uruguay)",
        "es-VE": "Spanish (Venezuela)",
        "eu-ES": "Basque (Spain)",
        "fil-PH": "Filipino (Philippines)",
        "fr-CA": "French (Canada)",
        "fr-FR": "French (France)",
        "gl-ES": "Galician (Spain)",
        "ka-GE": "Georgian (Georgia)",
        "gu-IN": "Gujarati (India)",
        "hr-HR": "Croatian (Croatia)",
        "zu-ZA": "Zulu (South Africa)",
        "is-IS": "Icelandic (Iceland)",
        "it-IT": "Italian (Italy)",
        "jv-ID": "Javanese (Indonesia)",
        "kn-IN": "Kannada (India)",
        "km-KH": "Khmer (Cambodia)",
        "lo-LA": "Lao (Laos)",
        "lv-LV": "Latvian (Latvia)",
        "lt-LT": "Lithuanian (Lithuania)",
        "hu-HU": "Hungarian (Hungary)",
        "ml-IN": "Malayalam (India)",
        "mr-IN": "Marathi (India)",
        "nl-NL": "Dutch (Netherlands)",
        "ne-NP": "Nepali (Nepal)",
        "nb-NO": "Norwegian Bokmål (Norway)",
        "pl-PL": "Polish (Poland)",
        "pt-BR": "Portuguese (Brazil)",
        "pt-PT": "Portuguese (Portugal)",
        "ro-RO": "Romanian (Romania)",
        "si-LK": "Sinhala (Sri Lanka)",
        "sk-SK": "Slovak (Slovakia)",
        "sl-SI": "Slovenian (Slovenia)",
        "su-ID": "Sundanese (Indonesia)",
        "sw-TZ": "Swahili (Tanzania)",
        "sw-KE": "Swahili (Kenya)",
        "fi-FI": "Finnish (Finland)",
        "sv-SE": "Swedish (Sweden)",
        "ta-IN": "Tamil (India)",
        "ta-SG": "Tamil (Singapore)",
        "ta-LK": "Tamil (Sri Lanka)",
        "ta-MY": "Tamil (Malaysia)",
        "te-IN": "Telugu (India)",
        "vi-VN": "Vietnamese (Vietnam)",
        "tr-TR": "Turkish (Turkey)",
        "ur-PK": "Urdu (Pakistan)",
        "ur-IN": "Urdu (India)",
        "el-GR": "Greek (Greece)",
        "bg-BG": "Bulgarian (Bulgaria)",
        "ru-RU": "Russian (Russia)",
        "sr-RS": "Serbian (Serbia)",
        "uk-UA": "Ukrainian (Ukraine)",
        "he-IL": "Hebrew (Israel)",
        "ar-IL": "Arabic (Israel)",
        "ar-JO": "Arabic (Jordan)",
        "ar-AE": "Arabic (United Arab Emirates)",
        "ar-BH": "Arabic (Bahrain)",
        "ar-DZ": "Arabic (Algeria)",
        "ar-SA": "Arabic (Saudi Arabia)",
        "ar-IQ": "Arabic (Iraq)",
        "ar-KW": "Arabic (Kuwait)",
        "ar-MA": "Arabic (Morocco)",
        "ar-TN": "Arabic (Tunisia)",
        "ar-OM": "Arabic (Oman)",
        "ar-PS": "Arabic (State of Palestine)",
        "ar-QA": "Arabic (Qatar)",
        "ar-LB": "Arabic (Lebanon)",
        "ar-EG": "Arabic (Egypt)",
        "fa-IR": "Persian (Iran)",
        "hi-IN": "Hindi (India)",
        "th-TH": "Thai (Thailand)",
        "ko-KR": "Korean (South Korea)",
        "zh-TW": "Chinese, Mandarin (Traditional, Taiwan)",
        "yue-Hant-HK": "Chinese, Cantonese (Traditional, Hong Kong)",
        "ja-JP": "Japanese (Japan)",
        "zh-HK": "Chinese, Mandarin (Simplified, Hong Kong)",
        "zh": "Chinese, Mandarin (Simplified, China)"
    };
    await speed_to_text('./audio.mp3', 'en-US')
})();
