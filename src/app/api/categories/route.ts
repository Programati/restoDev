import { listCategoriesAction } from "@/actions/categories/listCategories.action"

const STATUS = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const

const toBoolean = (value: string | null) =>
  value === null ? undefined : value === "true" ? true : value === "false" ? false : value

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams

  const result = await listCategoriesAction({
    search: params.get("search") ?? undefined,
    active: toBoolean(params.get("active")),
    include_deleted: toBoolean(params.get("include_deleted")),
  })

  return Response.json(result, { status: result.ok ? 200 : STATUS[result.error.code] })
}
