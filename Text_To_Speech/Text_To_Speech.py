import sys
from gtts import gTTS

Dialog = " ".join(sys.argv[1:]) 
def speech_to_text(ftext):	
	SpeechFile= gTTS(text=ftext, lang='en', tld='com.au', slow=False)
	SpeechFile.save("Speech.mp3")
speech_to_text(Dialog)