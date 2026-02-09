export type Person = {
  id: string
  name: string
  title?: string
  company?: string
  email?: string
  status: "NOT_ENRICHED" | "ENRICHING" | "ENRICHED" | "FAILED"
}
