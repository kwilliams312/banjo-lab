window.BANJO_THEORY = Object.freeze({
  degrees: ["I", "II", "III", "IV", "V", "VI", "VII"],
  keys: [
    { major: "C", minor: "A", signature: "No sharps or flats", chords: ["C", "Dm", "Em", "F", "G", "Am", "B°"] },
    { major: "G", minor: "E", signature: "1 sharp", chords: ["G", "Am", "Bm", "C", "D", "Em", "F♯°"] },
    { major: "D", minor: "B", signature: "2 sharps", chords: ["D", "Em", "F♯m", "G", "A", "Bm", "C♯°"] },
    { major: "A", minor: "F♯", signature: "3 sharps", chords: ["A", "Bm", "C♯m", "D", "E", "F♯m", "G♯°"] },
    { major: "E", minor: "C♯", signature: "4 sharps", chords: ["E", "F♯m", "G♯m", "A", "B", "C♯m", "D♯°"] },
    { major: "B", minor: "G♯", signature: "5 sharps", chords: ["B", "C♯m", "D♯m", "E", "F♯", "G♯m", "A♯°"] },
    {
      major: "F♯ / G♭",
      minor: "D♯ / E♭",
      signature: "6 sharps / 6 flats",
      chords: ["F♯ / G♭", "G♯m / A♭m", "A♯m / B♭m", "B / C♭", "C♯ / D♭", "D♯m / E♭m", "E♯° / F°"],
    },
    { major: "D♭", minor: "B♭", signature: "5 flats", chords: ["D♭", "E♭m", "Fm", "G♭", "A♭", "B♭m", "C°"] },
    { major: "A♭", minor: "F", signature: "4 flats", chords: ["A♭", "B♭m", "Cm", "D♭", "E♭", "Fm", "G°"] },
    { major: "E♭", minor: "C", signature: "3 flats", chords: ["E♭", "Fm", "Gm", "A♭", "B♭", "Cm", "D°"] },
    { major: "B♭", minor: "G", signature: "2 flats", chords: ["B♭", "Cm", "Dm", "E♭", "F", "Gm", "A°"] },
    { major: "F", minor: "D", signature: "1 flat", chords: ["F", "Gm", "Am", "B♭", "C", "Dm", "E°"] },
  ],
});
