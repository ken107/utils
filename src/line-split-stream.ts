import { Transform } from "stream"


export function makeLineSplitStream() {
  // Buffer for the part of the chunk that doesn't form a complete line.
  let remainder = ''

  return new Transform({
    transform(chunk, encoding, callback) {
      // Convert chunk to string and add it to the remainder.
      const chunkStr = remainder + chunk.toString()
      const lines = chunkStr.split('\n')

      // Keep the last line in remainder if it doesn't end with a newline character.
      remainder = lines.pop()!

      // Push each complete line.
      for (const line of lines) this.push(line + '\n')
      callback()
    },

    flush(callback) {
      // When the stream is ending, push any remainder as a line if it's not empty.
      if (remainder) this.push(remainder + '\n')
      callback()
    },
  })
}
