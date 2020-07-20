from pydub import AudioSegment
import speech_recognition as sr

sound = AudioSegment.from_file("audio.mp3")
sound.export("audio.wav", format="wav")

AUDIO_FILE = ("audio.wav")

# use the audio file as the audio source

r = sr.Recognizer()

with sr.AudioFile(AUDIO_FILE) as source:
    # reads the audio file. Here we use record instead of
    # listen
    audio = r.record(source)

print(r.recognize_google(audio))

