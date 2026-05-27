"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { defineStyles, useStyles } from "@/components/hooks/useStyles";
import { isUnresignedForum } from "@/lib/forumTypeUtils";

const DEATHS_PER_MINUTE = 90;

function formatDeathCount(deaths: number, compact: boolean): string {
  if (!compact || deaths < 10_000) {
    return deaths.toLocaleString("en-US");
  }
  if (deaths < 1_000_000) {
    const thousands = deaths / 1000;
    return `${thousands >= 100 ? Math.round(thousands) : thousands.toFixed(1)}k`;
  }
  const millions = deaths / 1_000_000;
  return `${millions >= 10 ? Math.round(millions) : millions.toFixed(1)}M`;
}

const styles = defineStyles("FloatingDeathCounter", (theme: ThemeType) => ({
  root: {
    position: "fixed",
    right: 16,
    bottom: 16,
    zIndex: theme.zIndexes.reactionsFooter,
    pointerEvents: "none",
    [theme.breakpoints.down("xs")]: {
      right: 12,
      bottom: "max(12px, env(safe-area-inset-bottom, 0px))",
    },
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
    width: "max-content",
    maxWidth: "min(240px, calc(100vw - 32px))",
    padding: "6px 10px",
    boxSizing: "border-box",
    ...theme.typography.caption,
    color: theme.palette.text.dim60,
    textAlign: "right",
    background: `linear-gradient(to top left, ${theme.palette.background.default}, transparent)`,
    [theme.breakpoints.down("xs")]: {
      maxWidth: "calc(100vw - 24px)",
      padding: "4px 8px",
    },
  },
  line1: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.35,
    color: theme.palette.text.primary,
    textAlign: "right",
    whiteSpace: "nowrap",
    [theme.breakpoints.down("xs")]: {
      fontSize: 12,
    },
  },
  count: {
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
  },
  caption: {
    margin: 0,
    fontSize: 11,
    lineHeight: 1.35,
    opacity: 0.92,
  },
}));

const FloatingDeathCounter = () => {
  const classes = useStyles(styles);
  const startMs = useRef<number>(Date.now());
  const [deaths, setDeaths] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [useCompactCount, setUseCompactCount] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 600px)");
    const updateCompact = () => setUseCompactCount(mq.matches);
    updateCompact();
    mq.addEventListener("change", updateCompact);
    return () => mq.removeEventListener("change", updateCompact);
  }, []);

  useEffect(() => {
    startMs.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startMs.current;
      setDeaths(Math.floor((elapsed / 60_000) * DEATHS_PER_MINUTE));
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, []);

  if (!mounted || !isUnresignedForum()) {
    return null;
  }

  const personWord = deaths === 1 ? "person" : "people";
  const countLabel = formatDeathCount(deaths, useCompactCount);

  const overlay = (
    <div className={classes.root}>
      <div className={classes.panel} aria-live="polite">
        <p className={classes.line1}>
          <span className={classes.count}>{countLabel}</span>
          {` ${personWord} died`}
        </p>
        <p className={classes.caption}>{"since you've opened the page"}</p>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default FloatingDeathCounter;
