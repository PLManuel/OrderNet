import { useState, useRef } from "react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  available: boolean
  categoryDTO: {
    id: number
    name: string
  }
}

interface Props {
  products: Product[]
  onSetItems: (items: Record<number, number>) => void
  onAddNotes: (notes: string) => void
}

const VoiceOrderButton = ({ products, onSetItems, onAddNotes }: Props) => {
  const [isListening, setIsListening] = useState(false)
  const [lastTranscript, setLastTranscript] = useState("")
  const [warnings, setWarnings] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "es-PE"
    speechSynthesis.speak(utterance)
  }

  const generatePrompt = (transcript: string) => {
    const productList = products.map((p) => p.name).join(", ")

    return `Eres un sistema que procesa pedidos por voz en un restaurante.

Del siguiente texto del cliente, extrae los productos que coincidan con el menú disponible.
Corrige errores comunes si son evidentes. Ignora productos no válidos y añade advertencias si el cliente menciona productos que no existen.

Devuelve solo un JSON con el siguiente formato:

{
  "items": [
    { "name": "NombreProducto", "quantity": número }
  ],
  "notes": "Texto libre con instrucciones adicionales",
  "warnings": ["Producto 'X' no reconocido"]
}

Menú disponible:
${productList}

Texto del cliente:
"${transcript}"`
  }

  const callDeepSeek = async (transcript: string) => {
    try {
      setIsProcessing(true)
      const prompt = generatePrompt(transcript)
      console.log("🧠 Prompt generado para IA:\n", prompt)

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer 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",
          "Content-Type": "application/json",
          "X-Title": "Pedidos por voz",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: [{ role: "user", content: prompt }],
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Error ${res.status}: ${errText}`)
      }

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || ""

      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
      if (!jsonMatch) throw new Error("No se encontró bloque JSON válido.")

      const cleanJson = jsonMatch[1].trim()
      return JSON.parse(cleanJson)
    } catch (err) {
      console.error("Error al llamar a DeepSeek:", err)
      speak("Hubo un problema al procesar el pedido.")
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  const handleParsedResponse = (response: any) => {
    const nameToId = new Map(products.map((p) => [p.name.toLowerCase(), p.id]))
    const resultItems: Record<number, number> = {}

    for (const item of response.items || []) {
      const id = nameToId.get(item.name.toLowerCase())
      if (id) {
        resultItems[id] = item.quantity
      }
    }

    if (Object.keys(resultItems).length > 0) {
      onSetItems(resultItems)
    }

    if (response.notes) {
      onAddNotes(response.notes)
    }

    if (response.warnings?.length) {
      setWarnings(response.warnings)
      speak(response.warnings.join(". "))
    } else {
      setWarnings([])
    }
  }

  const startListening = () => {
    if (isProcessing) return

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
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event)
      setIsListening(false)
    }
    recognition.onend = () => setIsListening(false)

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      console.log("Texto reconocido:", transcript)
      setLastTranscript(transcript)

      const response = await callDeepSeek(transcript)
      if (response) handleParsedResponse(response)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    recognitionRef.current?.abort()
    setIsListening(false)
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={startListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            isListening ? "bg-red-500" : "bg-yellow-500"
          } hover:opacity-90 text-white`}
          disabled={isProcessing}
        >
          🎤 {isListening ? "Escuchando..." : "Hablar Pedido"}
        </button>

        {isListening && (
          <button
            type="button"
            onClick={stopListening}
            className="text-sm underline text-red-600 hover:text-red-800"
          >
            Cancelar
          </button>
        )}
      </div>

      {lastTranscript && (
        <p className="text-sm text-gray-600">
          Texto reconocido: “{lastTranscript}”
        </p>
      )}

      {warnings.length > 0 && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded border-l-4 border-yellow-500">
          <ul className="list-disc ml-4">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {isProcessing && (
        <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
          <span className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></span>
          🧠 Procesando pedido...
        </div>
      )}
    </div>
  )
}

export default VoiceOrderButton
