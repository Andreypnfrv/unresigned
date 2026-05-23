import { getSiteUrlFromReq } from "@/server/utils/getSiteUrl";
import { getSkillDocumentationMarkdown } from "@/server/markdownApi/skillDocumentation";
import { NextRequest } from "next/server";

export { getSkillDocumentationMarkdown as markdownApiDocumentationMarkdown };

export function GET(req: NextRequest) {
  const urlPrefix = getSiteUrlFromReq(req);
  return new Response(getSkillDocumentationMarkdown(urlPrefix));
}
