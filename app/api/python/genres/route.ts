import { NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { top_n = 20 } = body

    // Execute Python script
    const scriptPath = path.join(process.cwd(), "scripts", "recommendation_engine.py")
    const pythonProcess = spawn("python", [
      "-c",
      `
import sys
sys.path.append('${path.join(process.cwd(), "scripts")}')
from recommendation_engine import recommendation_engine
import json

try:
    genres = recommendation_engine.get_genres(${top_n})
    print(json.dumps(genres))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`,
    ])

    let output = ""
    let error = ""

    pythonProcess.stdout.on("data", (data) => {
      output += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString()
    })

    return new Promise((resolve) => {
      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python script error:", error)
          resolve(NextResponse.json({ error: "Python script execution failed" }, { status: 500 }))
          return
        }

        try {
          const result = JSON.parse(output.trim())
          if (result.error) {
            resolve(NextResponse.json({ error: result.error }, { status: 500 }))
          } else {
            resolve(NextResponse.json(result))
          }
        } catch (parseError) {
          console.error("JSON parse error:", parseError)
          resolve(NextResponse.json({ error: "Failed to parse Python output" }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    console.error("Error in Python genres API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
