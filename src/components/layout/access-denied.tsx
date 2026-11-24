type AccessDeniedProps = {
  message: string
}

// Pantalla para quien tiene sesión pero no el permiso. Se usa con `requirePagePermission`.
export function AccessDenied({ message }: AccessDeniedProps) {
  return (
    <section className="p-6">
      <h1 className="text-xl font-semibold">Acceso denegado</h1>
      <p className="mt-2 text-sm">{message}.</p>
    </section>
  )
}
