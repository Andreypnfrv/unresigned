import { ZodType, z } from "zod"
import { FMCrosspostRoute } from "@/lib/fmCrosspost/routes"
import { combineUrls } from "@/lib/vulcan-lib/utils.ts";
import { isUnresignedForum } from "@/lib/forumTypeUtils";
import {
  fmCrosspostBaseUrlSetting,
  isConfiguredHttpOriginUrl,
} from "@/lib/instanceSettings";
import { crosspostUserAgent } from "@/lib/apollo/constants";
import { fmCrosspostTimeoutMsSetting } from "../databaseSettings";
import {
  ApiError,
  TOS_NOT_ACCEPTED_ERROR,
  TOS_NOT_ACCEPTED_REMOTE_ERROR,
} from "@/server/fmCrosspost/errors";

export function networkErrorDnsFailure(e: unknown): boolean {
  let cur: unknown = e;
  for (let i = 0; i < 5 && cur && typeof cur === "object"; i++) {
    const code = (cur as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") return true;
    cur = (cur as { cause?: unknown }).cause;
  }
  return false;
}

export const makeV2CrossSiteRequest = async <
  RequestSchema extends ZodType,
  ResponseSchema extends ZodType,
  RequestData extends z.infer<RequestSchema>,
>(
  route: FMCrosspostRoute<RequestSchema, ResponseSchema, RequestData>,
  body: RequestData,
  onErrorMessage: string,
) => {
  if (isUnresignedForum()) {
    throw new ApiError(
      503,
      `${onErrorMessage} (FM crosspost is not used on Unresigned)`,
    );
  }

  const crosspostBase = fmCrosspostBaseUrlSetting.get();
  if (!isConfiguredHttpOriginUrl(crosspostBase)) {
    throw new ApiError(
      503,
      `${onErrorMessage} (foreign forum base URL missing or unresolved placeholder hostname)`,
    );
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    fmCrosspostTimeoutMsSetting.get(),
  );

  const url = combineUrls(crosspostBase ?? "", route.getPath());

  let result: Response;
  try {
    result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": crosspostUserAgent,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timeoutId);

    if (e.name === "AbortError") {
      throw new ApiError(500, "Crosspost request timed out");
    }

    if (e.cause?.code === "ECONNREFUSED" && e.cause?.port === 4000) {
      // We're testing locally, and the x-post server isn't running
      // eslint-disable-next-line no-console
      console.warn("Dev crosspost server is not running");
      return {} as z.infer<ResponseSchema>;
    } else if (networkErrorDnsFailure(e)) {
      throw new ApiError(503, `${onErrorMessage} (foreign forum host unreachable)`);
    } else {
      throw new Error("Failed to make cross-site request", {cause: e});
    }
  }

  clearTimeout(timeoutId);

  const rawBody = await result.json();
  const parsedBody = route.getResponseSchema().safeParse(rawBody);
  if (!parsedBody.success || parsedBody.error) {
    // eslint-disable-next-line no-console
    console.error("Cross-site request failed:", rawBody);
    const errorMessage =
      "error" in rawBody && rawBody.error === TOS_NOT_ACCEPTED_ERROR
        ? TOS_NOT_ACCEPTED_REMOTE_ERROR
        : onErrorMessage;
    throw new ApiError(500, errorMessage);
  }
  return parsedBody.data;
}
