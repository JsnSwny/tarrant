import sys
from gtts import gTTS

serial = sys.argv[1]
Dialog = " ".join(sys.argv[2:]) 
def speech_to_text(ftext):	
	SpeechFile= gTTS(text=ftext, lang='en', tld='com.au', slow=False)
	SpeechFile.save("public/audios/" + serial + ".mp3")
speech_to_text(Dialog)
