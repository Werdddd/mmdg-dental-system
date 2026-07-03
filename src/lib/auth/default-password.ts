function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function defaultPassword(firstName: string, lastName: string) {
  return `${capitalize(firstName)}${capitalize(lastName)}${new Date().getFullYear()}`
}
