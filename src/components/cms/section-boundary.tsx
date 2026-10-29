"use client";

import { Component, type ReactNode } from "react";

/**
 * Safe fallback: if one section throws while rendering on the client, that section disappears and the rest of the
 * page keeps working (instead of the whole page being replaced by an error screen).
 */
export class SectionBoundary extends Component<{ type: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: unknown) { console.error(`[cms] section "${this.props.type}" failed to render and was hidden`, error); }
  render() { return this.state.failed ? null : this.props.children; }
}
