import "@/components/momentjs";

import React, { Suspense } from "react";
import ClientAppGenerator from "@/components/layout/ClientAppGenerator";
import { cookies } from "next/headers";
import ClientIDAssigner from "@/components/analytics/ClientIDAssigner";
import { CLIENT_ID_COOKIE, CLIENT_ID_NEW_COOKIE } from "@/lib/cookies/cookies";
import { SharedScripts } from "@/components/next/SharedScripts";
import { getDefaultMetadata } from "@/server/pageMetadata/sharedMetadata";
import { getSettings } from "@/server/settings/settings";
import type { Metadata } from "next";
import { BodyWithBackgroundColor } from "@/components/layout/PageBackgroundWrapper";
import PageBackgroundColorSwitcher from "@/components/layout/PageBackgroundColorSwitcher";

export async function generateMetadata(): Promise<Metadata> {
  return getDefaultMetadata();
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getRequestIdForServerComponentOrGenerateMetadata } = await import("@/server/rendering/requestId");
  const requestId = await getRequestIdForServerComponentOrGenerateMetadata();
  const { public: publicInstanceSettings } = getSettings();

  return (
    <html>
      <head>
        <SharedScripts publicInstanceSettings={publicInstanceSettings}/>
      </head>
      <BodyWithBackgroundColor>
        <Suspense fallback={null}>
          <ClientIDAssignerServer/>
        </Suspense>
        <PageBackgroundColorSwitcher/>
        <ClientAppGenerator abTestGroupsUsed={{}} requestId={requestId}>
          {children}
        </ClientAppGenerator>
      </BodyWithBackgroundColor>
    </html>
  );
}

const ClientIDAssignerServer = async () => {
  const ClientIdsRepo = (await import("@/server/repos/ClientIdsRepo")).default;
  const cookieStore = await cookies();
  const clientId = cookieStore.get(CLIENT_ID_COOKIE)?.value ?? null;
  const clientIdNewCookieExists = !!cookieStore.get(CLIENT_ID_NEW_COOKIE)?.value;
  const clientIdInvalidated = clientId && await new ClientIdsRepo().isClientIdInvalidated(clientId); // TODO Move off the critical path
  return <ClientIDAssigner clientIdNewCookieExists={clientIdNewCookieExists} clientIdInvalidated={!!clientIdInvalidated}/>;
};
