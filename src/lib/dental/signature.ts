// A captured signature is either freehand-drawn (data = a PNG data URL from
// a <canvas>) or typed (data = the chosen name, rendered in a script font).
// Shared between the SignaturePad UI component and the data layer so
// lib/data/*.ts doesn't need to import from components/.
export interface SignatureValue {
  type: 'drawn' | 'typed'
  data: string
}
