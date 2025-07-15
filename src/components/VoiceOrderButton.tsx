import { useState, useRef } from "react"

const VoiceOrderButton = ({
  onResult,
}: {
  onResult: (transcript: string) => void
}) => {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "es-PE"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      console.log("Texto reconocido:", transcript)
      onResult(transcript)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  return (
    <button
      type="button"
      onClick={startListening}
      className={`flex items-center gap-2 px-4 py-2 rounded-md ${
        isListening ? "bg-red-500" : "bg-yellow-500"
      } hover:opacity-90 text-white`}
    >
      🎤 {isListening ? "Escuchando..." : "Hablar Pedido"}
    </button>
  )
}

export default VoiceOrderButton
