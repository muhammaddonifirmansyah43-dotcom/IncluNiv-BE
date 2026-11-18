import { Request } from "express";

export function parsePagination(query: Request["query"]) {
  const page = Math.max(parseInt(String(query.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(query.limit ?? "10"), 10) || 10, 1), 100);
  const search = typeof query.search === "string" ? query.search.trim() : "";
  return { page, limit, search };
}