const ESTADOS = Object.freeze({
  PENDIENTE: 'Pendiente',
  EN_CURSO: 'En Curso',
  TERMINADA: 'Terminada',
  CANCELADA: 'Cancelada'
});

const DIFICULTADES = Object.freeze({
  FACIL: 'Facil',
  MEDIO: 'Medio',
  DIFICIL: 'Dificil'
});

const EMOJIS_DIFICULTAD = Object.freeze({
  [DIFICULTADES.FACIL]: '⭐',
  [DIFICULTADES.MEDIO]: '⭐⭐',
  [DIFICULTADES.DIFICIL]: '⭐⭐⭐'
});

module.exports = { ESTADOS, DIFICULTADES, EMOJIS_DIFICULTAD };