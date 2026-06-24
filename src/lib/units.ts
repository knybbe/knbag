import type { UnitSystem } from '../types'

const CM_PER_IN = 2.54
const KG_PER_LB = 0.453592

export function cmToIn(cm: number): number {
  return cm / CM_PER_IN
}

export function inToCm(inches: number): number {
  return inches * CM_PER_IN
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB
}

export function lengthLabel(units: UnitSystem): string {
  return units === 'metric' ? 'cm' : 'in'
}

export function weightLabel(units: UnitSystem): string {
  return units === 'metric' ? 'kg' : 'lb'
}

export function displayLength(cm: number, units: UnitSystem): string {
  if (units === 'metric') return `${round(cm)} cm`
  return `${round(cmToIn(cm))} in`
}

export function displayWeight(kg: number, units: UnitSystem): string {
  if (units === 'metric') return `${round(kg)} kg`
  return `${round(kgToLb(kg))} lb`
}

export function parseLengthInput(value: number, units: UnitSystem): number {
  return units === 'metric' ? value : inToCm(value)
}

export function parseWeightInput(value: number, units: UnitSystem): number {
  return units === 'metric' ? value : lbToKg(value)
}

export function toDisplayLength(cm: number, units: UnitSystem): number {
  return units === 'metric' ? round(cm) : round(cmToIn(cm))
}

export function toDisplayWeight(kg: number, units: UnitSystem): number {
  return units === 'metric' ? round(kg) : round(kgToLb(kg))
}

function round(n: number, decimals = 1): number {
  const factor = 10 ** decimals
  return Math.round(n * factor) / factor
}