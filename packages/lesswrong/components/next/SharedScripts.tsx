'use client';
import React, { useMemo } from 'react';

import { getEmbeddedStyleLoaderScript } from "@/components/hooks/embedStyles";
import { getSsrInjectedGraphqlLoaderScript } from "@/components/hooks/ssrInjectedGraphql";
import { toEmbeddableJson } from "@/lib/utils/jsonUtils";
import { getInstanceSettings } from "@/lib/getInstanceSettings";
import { globalExternalStylesheets } from "@/themes/globalStyles/externalStyles";
import { faviconUrlSetting, isUnresignedForum } from '@/lib/instanceSettings';

const unresignedGoogleFonts =
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&family=Spectral:ital,wght@0,400;0,600;1,400&display=swap";

// These exist as a client component to avoid the RSC rehydration protocol
// putting them into the initial streamed response chunk twice.
const SharedScriptsInner = () => {
  const { public: publicInstanceSettings } = getInstanceSettings();
  return (<>
      {isUnresignedForum() && <>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link rel="stylesheet" href={unresignedGoogleFonts}/>
      </>}
      {globalExternalStylesheets.map(stylesheet => <link key={stylesheet} rel="stylesheet" type="text/css" href={stylesheet}/>)}
      <script dangerouslySetInnerHTML={{__html: `window.publicInstanceSettings = ${toEmbeddableJson(publicInstanceSettings)}`}}/>
      <script dangerouslySetInnerHTML={{__html: getEmbeddedStyleLoaderScript()}}/>
      <script dangerouslySetInnerHTML={{__html: getSsrInjectedGraphqlLoaderScript()}}/>
      
      <meta httpEquiv='delegate-ch' content='sec-ch-dpr https://res.cloudinary.com;' />
      <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width"/>
      {/* HACK: These insertion-point markers are <script> tags (rather than
        * <style> tags) because <style> is special-cased in a way that
        * interacts badly with our dynamic insertion leading to a hydration
        * mismatch */}
      <script id="jss-insertion-start"/>
      {/*Style tags are dynamically inserted here*/}
      <script id="jss-insertion-end"/>
      <link rel="icon" href={faviconUrlSetting.get()}/>
  </>)
};

export const SharedScripts = () => {
  return useMemo(() => <SharedScriptsInner/>, []);
}
